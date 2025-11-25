import React, { useState, useEffect, useRef } from "react";
import "./DinoGame.css"; 
import dogHappy from "./images/dog_happy.png";
import { useNavigate } from "react-router-dom"; 

export default function DinoDogGame() {
  const [isJumping, setIsJumping] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [hasReachedGoal, setHasReachedGoal] = useState(false); 

  const dogRef = useRef(null);
  const obstacleRef = useRef(null);
  const navigate = useNavigate();
  
  // NOUA FUNCȚIE DE RESETARE A JOCULUI
  const resetGame = () => {
    setIsJumping(false);
    setGameOver(false);
    setScore(0);
    setHasReachedGoal(false);
    
    // Asigură-te că animația obstacolului repornește
    if (obstacleRef.current) {
        obstacleRef.current.style.animationPlayState = 'running';
        // Dacă nu merge automat, forțează o mică resetare a poziției
        obstacleRef.current.style.right = '-60px'; 
    }
  };

  // 1. Logica pentru Sărit și Verificarea Obiectivului
  useEffect(() => {
    const handleKey = (e) => {
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
      if (!dogRef.current || !obstacleRef.current || gameOver) return;

      const dogRect = dogRef.current.getBoundingClientRect();
      const obsRect = obstacleRef.current.getBoundingClientRect();

      const hit =
        dogRect.right > obsRect.left &&
        dogRect.left < obsRect.right &&
        dogRect.bottom > obsRect.top;

      if (hit) {
        setGameOver(true);
        
        // Logica bonusului de fericire
        if (hasReachedGoal) {
             localStorage.setItem("game_result", "win"); 
        } else {
             localStorage.setItem("game_result", "lose"); 
        }
        
        // Oprește animația obstacolului
        const obstacleElement = obstacleRef.current;
        if (obstacleElement) {
            obstacleElement.style.animationPlayState = 'paused';
        }
      }
    }, 50);

    return () => clearInterval(checkCollision);
  }, [gameOver, hasReachedGoal]); 

  // Funcție de întoarcere la Pet
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

          <div ref={obstacleRef} className="obstacle"></div>

          <div className="score-box">Sărituri: {score}</div>
          
          {hasReachedGoal && <div className="goal-reached">✅ Obiectiv de bonus atins!</div>} 
        </>
      )}

      {gameOver && (
        <div className="game-over">
          <h1>
            {hasReachedGoal ? "Ai obținut bonusul! 🎉" : "Ai pierdut! 😢"}
          </h1>
          <p>Ai reușit **{score}** sărituri.</p>
          
          <button className="retry" onClick={resetGame}>Joacă din nou</button> 
          
          <button className="back" onClick={handleBackToPet}>Înapoi la Pet</button>
        </div>
      )}

    </div>
  );
}
