// DinoGame.js (sau DinoDogGame.js)
import React, { useState, useEffect, useRef } from "react"; 
import "./DinoGame.css"; 
import dogHappy from "./images/dog_happy.png";
import { useNavigate } from "react-router-dom"; 

export default function DinoDogGame() {
  const [isJumping, setIsJumping] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [hasReachedGoal, setHasReachedGoal] = useState(false); 

  // NOU: Starea pentru cel mai bun scor citit din localStorage
  const [bestScore, setBestScore] = useState(() => {
    const savedScore = localStorage.getItem('dino_best_score');
    return savedScore ? parseInt(savedScore, 10) : 0;
  });

  const dogRef = useRef(null);
  const obstacleRef = useRef(null);
  const navigate = useNavigate();
  
  // LOGICĂ NOUĂ: DETERMINAREA CLASEI DE VITEZĂ
  const getSpeedClass = () => {
    if (score >= 15) return 'speed-4'; 
    if (score >= 10) return 'speed-3';
    if (score >= 5) return 'speed-2';
    return 'speed-1'; 
  };
  
  const resetGame = () => {
    setIsJumping(false);
    setGameOver(false);
    setScore(0);
    setHasReachedGoal(false);
    
    if (obstacleRef.current) {
        obstacleRef.current.style.animationPlayState = 'running';
        obstacleRef.current.style.right = '-60px'; 
    }
  };

  // 1. Logica pentru Sărit
  useEffect(() => {
    const handleKey = (e) => {
      
      if (e.repeat) return; 

      if (e.code === "Space" && !isJumping && !gameOver) { 
        setIsJumping(true);
        
        setScore((s) => {
            const newScore = s + 1;
            if (newScore >= 15) {
                setHasReachedGoal(true); 
            }
            return newScore;
        });

        setTimeout(() => setIsJumping(false), 500);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isJumping, gameOver]); 

  // 2. Logica pentru Coliziune (Game Over)
  useEffect(() => {
    const checkCollision = setInterval(() => {
      // Necesită actualizarea la fiecare schimbare de scor sau record
      if (!dogRef.current || !obstacleRef.current || gameOver) return;

      const dogRect = dogRef.current.getBoundingClientRect();
      const obsRect = obstacleRef.current.getBoundingClientRect();

      const hit =
        dogRect.right > obsRect.left &&
        dogRect.left < obsRect.right &&
        dogRect.bottom > obsRect.top;

      if (hit) {
        setGameOver(true);
        
        // --- LOGICA NOUĂ: SALVARE BEST SCORE ---
        if (score > bestScore) {
          setBestScore(score);
          localStorage.setItem('dino_best_score', score.toString());
        }
        // ------------------------------------
        
        if (hasReachedGoal) {
             localStorage.setItem("game_result", "win"); 
        } else {
             localStorage.setItem("game_result", "lose"); 
        }
        
        const obstacleElement = obstacleRef.current;
        if (obstacleElement) {
            obstacleElement.style.animationPlayState = 'paused';
        }
      }
    }, 50);

    return () => clearInterval(checkCollision);
  }, [gameOver, hasReachedGoal, score, bestScore]); // Adaugă dependențe pentru scor și record

  const handleBackToPet = () => {
    navigate("/");
  };

  return (
    <div className="dog-game-bg">

      {!gameOver && (
        <>
          <img
            ref={dogRef}
            src={dogHappy}
            alt="dog"
            className={`dog ${isJumping ? "jump" : ""}`}
          />

          {/* Key-ul forțează repornirea animației la schimbarea vitezei */}
          <div 
            key={getSpeedClass()} 
            ref={obstacleRef} 
            className={`obstacle ${getSpeedClass()}`}
          ></div>

          {/* NOU: Container pentru a afișa ambele scoruri */}
          <div className="score-container">
            <div className="score-box">Sărituri: {score}</div>
            <div className="best-score-box">Record: {bestScore}</div>
          </div>
          
          {hasReachedGoal && <div className="goal-reached">✅ Obiectiv de bonus atins!</div>} 
        </>
      )}

      {gameOver && (
        <div className="game-over">
          <h1>
            {hasReachedGoal ? "Ai obținut bonusul! 🎉" : "Ai pierdut! 😢"}
          </h1>
          
          {/* NOU: Mesaj special pentru Noul Record */}
          {score > bestScore ? (
            <p className="new-record">🎉 NOU RECORD: {score} sărituri! 🎉</p>
          ) : (
            <p className="current-record">Recordul tău curent: {bestScore} sărituri</p>
          )}
          
          <button className="retry" onClick={resetGame}>Joacă din nou</button> 
          
          <button className="back" onClick={handleBackToPet}>Înapoi la Pet</button>
        </div>
      )}

    </div>
  );
}
