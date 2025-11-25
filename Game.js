import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Game.css";

import dogHappy from "./images/dog_happy.png";
import dogHungry from "./images/dog_hungry.png";
import dogSad from "./images/dog_sad.png";
import dogDirty from "./images/dog_dirty.png";

import happySound from "./sounds/happy_win.mp3";
import washSound from "./sounds/wash_complete.mp3";
import eatSound from "./sounds/happy_win.mp3";

const usePersistentState = (key, defaultValue) => {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem(key);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
};

const playAudio = (path) => {
  const audio = new Audio(path);
  audio.play().catch(() => {});
};

function Game() {
  const navigate = useNavigate();

  const [hunger, setHunger] = usePersistentState("pet_hunger", 50);
  const [cleanliness, setCleanliness] = usePersistentState("pet_cleanliness", 50);
  const [happiness, setHappiness] = usePersistentState("pet_happiness", 50);
  const [foodMenuVisible, setFoodMenuVisible] = useState(false);

  const [isCleaning, setIsCleaning] = useState(false);
  const [scrubCount, setScrubCount] = usePersistentState("scrub_count", 0);

  const CLEAN_THRESHOLD = 5;
  const [showPlayMenu, setShowPlayMenu] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setHunger(h => Math.min(100, h + 2));
      setCleanliness(c => Math.max(0, c - 1));
      setHappiness(h => Math.max(0, h - 1));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const result = localStorage.getItem("game_result");

    if (result === "win") {
      playAudio(happySound);
      setHappiness(100);
      setHunger(h => Math.max(0, h - 20));
    }

    if (result === "lose") {
      setHappiness(h => Math.min(100, h + 5));
    }

    localStorage.removeItem("game_result");
  }, []);

  const getPetImage = () => {
    if (hunger >= 70) return dogHungry;
    if (cleanliness <= 30) return dogDirty;
    if (happiness <= 30) return dogSad;
    return dogHappy;
  };

  const getAlertMessage = () => {
    if (hunger >= 85) return "🚨 Imi este FOAME!";
    if (cleanliness <= 15) return "🧼 Sunt foarte murdar!";
    if (happiness <= 15) return "😭 Sunt trist! Hai să ne jucăm!";
    return null;
  };

  const toggleFoodMenu = () => {
    if (!isCleaning) setFoodMenuVisible(v => !v);
  };

  const selectFood = (foodType) => {
    let hungerChange = 0;
    let happinessChange = 0;

    if (foodType === "biscuit") { hungerChange = -20; happinessChange = 10; }
    if (foodType === "steak") { hungerChange = -40; happinessChange = 20; }
    if (foodType === "vegetables") { hungerChange = -10; happinessChange = 5; }

    setHunger(h => Math.max(0, h + hungerChange));
    setHappiness(h => Math.min(100, h + happinessChange));

    setFoodMenuVisible(false);
    playAudio(eatSound);
  };

  const startCleaning = () => {
    if (!isCleaning) {
      setIsCleaning(true);
      setScrubCount(0);
    }
  };

  const performScrub = () => {
    if (!isCleaning) return;

    playAudio(washSound);
    const newCount = scrubCount + 1;
    setScrubCount(newCount);

    if (newCount >= CLEAN_THRESHOLD) {
      setCleanliness(c => Math.min(100, c + 30));
      setHappiness(h => Math.min(100, h + 10));
      setIsCleaning(false);
      setScrubCount(0);
    }
  };

  const playWithPet = () => {
    if (!isCleaning) setShowPlayMenu(true);
  };

  return (
    <div className="app">
      <h1>Virtual Pet</h1>

      <img
        src={getPetImage()}
        alt="pet"
        className={`pet-image ${isCleaning ? "cleaning-mode" : ""}`}
        onClick={performScrub}
      />

      {getAlertMessage() && (
        <div className="alert-message">{getAlertMessage()}</div>
      )}

      {isCleaning && (
        <div className="cleaning-status">🧼 {scrubCount} / {CLEAN_THRESHOLD}</div>
      )}

      {foodMenuVisible && (
        <div className="food-menu">
          <p>Alege mâncare:</p>
          <button onClick={() => selectFood("biscuit")}>🍪 Biscuit</button>
          <button onClick={() => selectFood("steak")}>🥩 Steak</button>
          <button onClick={() => selectFood("vegetables")}>🥗 Legume</button>
        </div>
      )}

      <div className="stats">
        <div>
          <p>Hunger: {hunger}</p>
          <progress value={hunger} max="100"></progress>
        </div>
        <div>
          <p>Cleanliness: {cleanliness}</p>
          <progress value={cleanliness} max="100"></progress>
        </div>
        <div>
          <p>Happiness: {happiness}</p>
          <progress value={happiness} max="100"></progress>
        </div>
      </div>

      <div className="buttons">
        <button onClick={toggleFoodMenu}>🍲 Feed</button>
        <button onClick={startCleaning}>🧼 Clean</button>
        <button onClick={playWithPet}>⚽ Play</button>
      </div>

      {showPlayMenu && (
        <div className="play-menu">
          <h3>Alege jocul:</h3>
          <button onClick={() => navigate("/minigame")}>🎮 MiniGame</button>
          <button onClick={() => navigate("/dino")}>🦖 Dino Runner</button>
          <button className="close-btn" onClick={() => setShowPlayMenu(false)}>✖ Închide</button>
        </div>
      )}
    </div>
  );
}

export default Game;
