import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './MiniGame.css'; // VOM AVEA NEVOIE DE UN FIȘIER CSS NOU!

function MiniGame() {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [targetVisible, setTargetVisible] = useState(false);
  const [targetPosition, setTargetPosition] = useState({ top: '50%', left: '50%' });
  const [gameActive, setGameActive] = useState(true);
  
  // Ref pentru a ține minte timer-ul principal
  const gameTimerRef = useRef(null);
  // Ref pentru a ține minte timer-ul de apariție a osului
  const targetTimerRef = useRef(null);

  // Funcția principală care gestionează apariția și dispariția osului
  const startTargetTimer = () => {
    // Curățăm orice timer existent înainte de a crea unul nou
    if (targetTimerRef.current) {
        clearTimeout(targetTimerRef.current);
    }

    // 1. Apariția Osului
    setTargetVisible(true);
    // Generează poziții aleatoare (între 10% și 90% pentru a nu ieși din ecran)
    const newPos = {
        top: `${Math.floor(Math.random() * 80) + 10}%`,
        left: `${Math.floor(Math.random() * 80) + 10}%`,
    };
    setTargetPosition(newPos);

    // 2. Timer de dispariție (Osul dispare după 700ms)
    targetTimerRef.current = setTimeout(() => {
        setTargetVisible(false);
    }, 700); // 700 milisecunde
  };

  // Funcția apelată la apăsarea Osului
  const hitTarget = () => {
    if (!targetVisible) return;
    
    setScore(s => s + 1); // Crește scorul
    setTargetVisible(false); // Ascunde osul imediat
    
    // Oprește timer-ul de dispariție al osului și începe unul nou
    if (targetTimerRef.current) {
        clearTimeout(targetTimerRef.current);
    }
    startTargetTimer();
  };

  // --- LOGICA JOCULUI (TIMER PRINCIPAL) ---
  useEffect(() => {
    if (!gameActive) return;

    // Setează timer-ul de numărătoare inversă
    const countdownTimer = setInterval(() => {
        setTimeLeft(t => {
            if (t <= 1) {
                // Jocul s-a terminat
                clearInterval(countdownTimer);
                setGameActive(false);
                setTargetVisible(false);
                return 0;
            }
            return t - 1;
        });
    }, 1000); // La fiecare secundă

    // Setează timer-ul pentru apariția osului (repetitiv)
    const targetInterval = setInterval(() => {
        startTargetTimer();
    }, 1000); // Osul apare la fiecare 1 secundă

    gameTimerRef.current = targetInterval; // Salvează referința

    // Funcția de curățare
    return () => {
        clearInterval(countdownTimer);
        clearInterval(targetInterval);
        if (targetTimerRef.current) {
            clearTimeout(targetTimerRef.current);
        }
    };
  }, [gameActive]); // Se rulează doar când jocul devine activ/inactiv

  // Funcția de întoarcere la simulator
  const handleReturn = () => {
    if (score >= 5) { // Pragul de câștig: 5 Osuri
      localStorage.setItem("game_result", "win"); 
    } else {
      localStorage.setItem("game_result", "lose"); 
    }
    navigate("/");
  };
  
  return (
    <div className="minigame-container">
      <h2>🦴 Prinde Osul! 🦴</h2>
      <p className="status-bar">
        Timp: **{timeLeft}s** | Scorul tău: **{score}**
      </p>

      {gameActive && (
        <div className="game-area">
          {targetVisible && (
            // Osul pe care trebuie să apeși
            <span 
              className="target"
              style={targetPosition}
              onClick={hitTarget}
            >
              🦴
            </span>
          )}
          <p className="instruction">Apasă pe Os înainte să dispară!</p>
        </div>
      )}

      {!gameActive && (
        <div className="game-over">
          <h3>Joc Terminat!</h3>
          <p>Ai prins **{score}** Osuri.</p>
          <p>{score >= 5 ? "Felicitări! Ai câștigat un bonus!" : "Ai nevoie de cel puțin 5 Osuri pentru bonus."}</p>
          <button onClick={handleReturn}>Întoarce-te la Animalul Tău</button>
        </div>
      )}
    </div>
  );
}

export default MiniGame;
