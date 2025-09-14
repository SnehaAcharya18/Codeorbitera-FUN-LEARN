import React, { useState, useEffect } from 'react';
import labImage from '../../assets/images/level7/lab.png';
import bc from '../../assets/sounds/midlevel7/bc2.mp3';
import pop from '../../assets/sounds/midlevel7/pop.mp3';
import success from '../../assets/sounds/midlevel7/success.mp3';
import pick from '../../assets/sounds/midlevel7/pick.mp3';
import axios from "axios";

export default function InsertionGame() {
  const demoItems = [6, 2, 4, 3]; // Demo array
  const gameItems = [7, 3, 5, 2, 4]; // Initial game array
  const nextLevelItems = [8, 1, 6, 4, 3]; // New array for next level
  const correctSorted = [...gameItems].sort((a, b) => a - b); // [2, 3, 4, 5, 7]

  const [items, setItems] = useState(demoItems);
  const [correctSortedItems, setCorrectSortedItems] = useState([...demoItems].sort((a, b) => a - b));
  const [gameState, setGameState] = useState('intro'); // intro, demo, playing, outro, quiz, result, paused
  const [draggedItem, setDraggedItem] = useState(null);
  const [moves, setMoves] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState('');
  const [stars, setStars] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [demoStep, setDemoStep] = useState(0);
  const [gameScore, setGameScore] = useState(0);
  const [currentLevelItems, setCurrentLevelItems] = useState(gameItems);
  const [isPaused, setIsPaused] = useState(false);

  // Audio instances
  const backgroundMusic = new Audio(bc);
  const popSound = new Audio(pop);
  const successSound = new Audio(success);
  const pickSound = new Audio(pick);

  const postScore = async (levelName, score) => {
    try {
      await axios.post("http://localhost:5000/api/auth/score", {
        level: levelName,
        score,
      }, { withCredentials: true });
    } catch (err) {
      console.error("Failed to post score:", err);
    }
  };

  useEffect(() => {
    if (gameState === "result") {
      const finalScore = gameScore + stars * 10;
      postScore("Level 9", finalScore);
    }
  }, [gameState]);

  // Background music control
  useEffect(() => {
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.5;
    if (gameState !== 'result' && !isPaused) {
      backgroundMusic.play().catch((error) => console.log('Background music play failed:', error));
    }
    return () => {
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
    };
  }, [gameState, isPaused]);

  // Timer for gameplay
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0 && !isPaused) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setStars(1);
            setGameScore(0);
            setGameState('result');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, timeLeft, isPaused]);

  // Demo mode: Simulate sorting with slower speed and pop sound
  useEffect(() => {
    if (gameState === 'demo' && demoStep < demoItems.length && !isPaused) {
      const timeout = setTimeout(() => {
        let newItems = [...items];
        let key = newItems[demoStep];
        let j = demoStep - 1;

        while (j >= 0 && newItems[j] > key) {
          newItems[j + 1] = newItems[j];
          j--;
        }
        newItems[j + 1] = key;
        setItems([...newItems]);
        setDemoStep((prev) => prev + 1);
        popSound.play().catch((error) => console.log('Pop sound play failed:', error));
      }, 3000);
      return () => clearTimeout(timeout);
    } else if (gameState === 'demo' && demoStep >= demoItems.length) {
      setTimeout(() => {
        setItems(currentLevelItems);
        setCorrectSortedItems([...currentLevelItems].sort((a, b) => a - b));
        setGameState('playing');
        setDemoStep(0);
      }, 1000);
    }
  }, [gameState, demoStep, items, currentLevelItems, isPaused]);

  // Check if sorted and calculate game score
  useEffect(() => {
    if (gameState === 'playing' && JSON.stringify(items) === JSON.stringify(correctSortedItems)) {
      const movePenalty = moves > 5 ? (moves - 5) * 10 : 0;
      const timeBonus = timeLeft * 2;
      const score = Math.max(0, 100 - movePenalty + timeBonus);
      setGameScore(score);
      setTimeout(() => {
        setGameState('outro');
      }, 500);
    }
  }, [items, correctSortedItems, gameState, moves, timeLeft]);

  const handleDragStart = (index) => {
    if (gameState === 'playing' && !isPaused) {
      setDraggedItem(index);
      pickSound.play().catch((error) => console.log('Pick sound play failed:', error));
    }
  };

  const handleDrop = (index) => {
    if (gameState !== 'playing' || isPaused || draggedItem === null || draggedItem === index) return;

    const newList = [...items];
    const item = newList.splice(draggedItem, 1)[0];
    newList.splice(index, 0, item);
    setItems(newList);
    setDraggedItem(null);
    setMoves((m) => m + 1);

    if (JSON.stringify(newList) === JSON.stringify(correctSortedItems)) {
      successSound.play().catch((error) => console.log('Success sound play failed:', error));
    }
  };

  const handleQuizSubmit = () => {
    const correctIndex = correctSortedItems.indexOf(3);
    if (quizAnswer.trim() === `${correctIndex}`) setStars(3);
    else if (Math.abs(parseInt(quizAnswer) - correctIndex) <= 1) setStars(2);
    else setStars(1);
    setGameState('result');
  };

  const handleNextLevel = () => {
    window.location.href = '/LifoGame';
  };

  const handleButtonClick = () => {
    popSound.play().catch((error) => console.log('Pop sound play failed:', error));
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    setGameState(isPaused ? 'playing' : 'paused');
  };

  const handleResume = () => {
    setIsPaused(false);
    setGameState('playing');
    handleButtonClick();
  };

  const handleRestart = () => {
    setItems(currentLevelItems);
    setCorrectSortedItems([...currentLevelItems].sort((a, b) => a - b));
    setMoves(0);
    setTimeLeft(60);
    setQuizAnswer('');
    setStars(0);
    setGameScore(0);
    setIsPaused(false);
    setGameState('playing');
    handleButtonClick();
  };

  const handleDashboard = () => {
    handleButtonClick();
    window.location.href = '/dashboard';
  };

  const renderGame = () => (
    <div className="lab">
      <div className="effects">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bubble"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 15 + 10}px`,
              height: `${Math.random() * 15 + 10}px`,
              animationDuration: `${Math.random() * 4 + 4}s`,
              '--random': Math.random(),
            }}
          />
        ))}
      </div>
      <h2 className="text-neon-green animate-flicker">
        {gameState === 'demo' ? 'Demo: Arrange in Ascending Order 🧪' : 'Sort Vials 🧪 to Save the Lab! 💥'}
      </h2>
      {gameState === 'demo' && (
        <p className="text-neon-green demo-instruction">
          Watch how to arrange vials from smallest to largest 👀
        </p>
      )}
      <div className="shelf">
        {items.map((item, index) => (
          <div
            key={index}
            className={`box ${gameState === 'playing' && draggedItem === index ? 'dragging' : ''}`}
            draggable={gameState === 'playing' && !isPaused}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => gameState === 'playing' && !isPaused && e.preventDefault()}
            onDrop={() => handleDrop(index)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {item} 🧪
          </div>
        ))}
      </div>
      <p className="text-neon-green">
        {gameState === 'playing' ? (
          `Moves: ${moves} | Time Left: ${timeLeft}s ⏱️`
        ) : (
          <span className="animate-pulse">Watch the Sort! 👀</span>
        )}
      </p>
    </div>
  );

  const renderStars = () => (
    <div className="stars">
      {[1, 2, 3].map((n) => (
        <span key={n} className={`star ${stars >= n ? 'filled' : ''}`}>
          ⭐
        </span>
      ))}
    </div>
  );

  const renderOutro = () => (
    <div className="screen">
      <h2 className="text-neon-green animate-flicker">Lab Saved! 🎉</h2>
      <p className="text-neon-green">
        You sorted the vials in ascending order! 🏆 Score: {gameScore} points
      </p>
      <div className="explanation">
        <h3 className="text-neon-yellow">How to Sort in Ascending Order</h3>
        <p className="text-neon-green">
          Sort numbers from smallest to largest by placing each number in its correct position, shifting larger numbers right.
        </p>
        <h4 className="text-neon-yellow">Example: [6, 2, 4, 3]</h4>
        <ul className="steps">
          <li>Number 2: Shift 6 right → [2, 6, 4, 3]</li>
          <li>Number 4: Shift 6 right → [2, 4, 6, 3]</li>
          <li>Number 3: Shift 6, 4 right → [2, 3, 4, 6]</li>
        </ul>
      </div>
      <div className="quiz-button-container">
        <button
          className="btn"
          onClick={() => {
            handleButtonClick();
            setGameState('quiz');
          }}
        >
          Hack the Quiz 💻
        </button>
      </div>
    </div>
  );

  const renderPauseMenu = () => (
    <div className="screen pause-menu">
      <h2 className="text-neon-green animate-flicker">Game Paused ⏸️</h2>
      <div className="button-container">
        <button
          className="btn"
          onClick={handleResume}
        >
          Resume ▶️
        </button>
        <button
          className="btn"
          onClick={handleRestart}
        >
          Restart 🔄
        </button>
        <button
          className="btn"
          onClick={handleDashboard}
        >
          Dashboard 🏠
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="game-container"
      style={{
        backgroundImage: `url(${labImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .game-container {
          font-family: 'Orbitron', sans-serif;
          height: 100vh;
          width: 100vw;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 2vw;
          color: #00ffcc;
          text-align: center;
          background-color: #0a0a1a;
          overflow: hidden;
          position: fixed;
          top: 0;
          left: 0;
        }

        .screen {
          width: 100%;
          max-width: 1300px;
          padding: 2vw;
          background: rgba(10, 10, 26, 0.85);
          border: 3px solid #ff00ff;
          border-radius: 15px;
          box-shadow: 0 0 20px #ff00ff, 0 0 40px #ff00ff inset;
          animation: glowPulse 3s ease-in-out infinite;
          position: relative;
          overflow-y: auto;
          max-height: 90vh;
        }

        .pause-btn {
          position: absolute;
          top: 1vw;
          left: 1vw;
          background: linear-gradient(45deg, #55ff55, #00ff00);
          color: #fff;
          padding: 0.6vw 1.2vw;
          border: none;
          border-radius: 8px;
          font-family: 'Orbitron', sans-serif;
          font-size: 1vw;
          cursor: pointer;
          box-shadow: 0 0 10px #55ff55, 0 0 20px #00ff00;
          transition: transform 0.2s, box-shadow 0.2s;
          z-index: 20;
        }

        .pause-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 0 15px #55ff55, 0 0 30px #00ff00;
        }

        .pause-menu {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .text-neon-green {
          color: #00ffcc;
          text-shadow: 0 0 8px #00ffcc, 0 0 15px #00ffcc;
        }

        .text-neon-yellow {
          color: #ffd700;
          text-shadow: 0 0 8px #ffd700, 0 0 15px #ffd700;
        }

        h1 {
          font-size: 4vw;
          font-weight: bold;
          margin-bottom: 1.5vw;
          animation: flicker 2s infinite;
        }

        h2 {
          font-size: 3vw;
          margin-bottom: 1vw;
        }

        h3 {
          font-size: 1.5vw;
          margin: 1vw 0;
        }

        h4 {
          font-size: 2vw;
          margin: 0.8vw 0;
        }

        p {
          font-size: 2vw;
          margin-bottom: 1.5vw;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
        }

        .demo-instruction {
          font-size: 1.1vw;
          margin-bottom: 1vw;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .btn {
          background: linear-gradient(45deg, #ff00ff, #00f0ff);
          color: #fff;
          padding: 0.8vw 1.6vw;
          border: none;
          border-radius: 10px;
          font-family: 'Orbitron', sans-serif;
          font-size: 2vw;
          cursor: pointer;
          box-shadow: 0 0 15px #ff00ff, 0 0 30px #00f0ff;
          transition: transform 0.2s, box-shadow 0.2s;
          z-index: 10;
          position: relative;
          margin: 0.5vw;
        }

        .btn:hover {
          transform: scale(1.1);
          box-shadow: 0 0 20px #ff00ff, 0 0 40px #00f0ff;
        }

        .quiz-button-container {
          text-align: center;
          margin-top: 1vw;
          margin-bottom: 2vw;
          z-index: 10;
          position: relative;
        }

        .button-container {
          display: flex;
          justify-content: center;
          gap: 1vw;
          margin-top: 1vw;
        }

        .lab {
          padding: 2vw;
          border: 4px solid #00f0ff;
          border-radius: 15px;
          box-shadow: 0 0 25px #00f0ff, 0 0 50px #00f0ff inset;
          position: relative;
          background: rgba(10, 10, 26, 0.9);
          overflow: hidden;
          width: 100%;
          max-width: 1000px;
          animation: glowPulse 3s ease-in-out infinite;
        }

        .shelf {
          display: flex;
          justify-content: center;
          gap: 1.5vw;
          padding: 3vw;
          background: linear-gradient(#1a1a3d, #0a0a1a);
          border: 2px solid #ff00ff;
          border-radius: 10px;
          box-shadow: 0 0 15px #ff00ff;
        }

        .box {
          width: 8vw;
          height: 8vw;
          background: linear-gradient(45deg, #00f0ff, #0066cc);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5vw;
          color: #fff;
          box-shadow: 0 0 15px #00f0ff, 0 0 30px #00f0ff;
          transition: transform 0.3s, box-shadow 0.3s;
          position: relative;
          animation: slideIn 0.6s ease-out forwards;
        }

        .box[draggable="true"] {
          cursor: grab;
        }

        .box:hover[draggable="true"] {
          transform: scale(1.15);
          box-shadow: 0 0 20px #00f0ff, 0 0 40px #00f0ff;
        }

        .box.dragging {
          opacity: 0.8;
          transform: scale(1.2);
          box-shadow: 0 0 25px #ff00ff;
        }

        .bubble {
          position: absolute;
          background: radial-gradient(circle, rgba(0, 255, 204, 0.5), rgba(0, 255, 204, 0));
          border-radius: 50%;
          animation: bubbleRise linear infinite;
        }

        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }

        .animate-flicker {
          animation: flicker 2s infinite;
        }

        .stars {
          display: flex;
          justify-content: center;
          gap: 1vw;
          font-size: 2.5vw;
          margin-top: 1.5vw;
        }

        .star {
          color: #333;
        }

        .star.filled {
          color: #ffd700;
          text-shadow: 0 0 10px #ffd700;
        }

        input {
          padding: 0.6vw;
          font-size: 1.2vw;
          border-radius: 8px;
          border: none;
          margin-top: 1vw;
          background: #1a1a3d;
          color: #fff;
          font-family: 'Orbitron', sans-serif;
        }

        .explanation {
          margin: 1.5vw 0;
          padding: 1vw;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 10px;
          border: 1px solid #00ffcc;
        }

        .steps {
          list-style-type: decimal;
          text-align: left;
          margin: 1vw auto;
          padding-left: 2vw;
          font-size: 1vw;
          color: #00ffcc;
        }

        .steps li {
          margin-bottom: 0.5vw;
        }

        @keyframes slideIn {
          from { transform: translateY(-5vw); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes bubbleRise {
          0% { transform: translateY(100vh) translateX(0); }
          100% { transform: translateY(-5vw) translateX(calc(5vw - 10vw * var(--random))); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }

        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px #ff00ff, 0 0 40px #ff00ff inset; }
          50% { box-shadow: 0 0 30px #ff00ff, 0 0 60px #ff00ff inset; }
        }
      `}</style>

      {(gameState === 'demo' || gameState === 'playing') && (
        <button
          className="pause-btn"
          onClick={togglePause}
        >
          {isPaused ? 'Resume' : 'Pause'} ⏸️
        </button>
      )}

      {gameState === 'intro' && (
        <div className="screen">
          <h1 className="text-neon-green animate-flicker">CyberLab: Sorting Crisis 🧪</h1>
          <p className="text-neon-green">
            Reactor meltdown imminent! 💥 Watch the demo to arrange vials in ascending order,
            then drag and drop them to sort from smallest to largest to save the lab! 🚨
          </p>
          <button
            className="btn"
            onClick={() => {
              handleButtonClick();
              setGameState('demo');
            }}
          >
            Watch Demo 👀
          </button>
        </div>
      )}

      {(gameState === 'demo' || gameState === 'playing') && renderGame()}

      {gameState === 'outro' && renderOutro()}

      {gameState === 'quiz' && (
        <div className="screen">
          <h2 className="text-neon-green animate-flicker">Quiz Hack 💾</h2>
          <p className="text-neon-green">
            Where would 3 go in [{correctSortedItems.join(', ')}]? (0-based index) ❓
          </p>
          <input
            placeholder="Enter position"
            value={quizAnswer}
            onChange={(e) => setQuizAnswer(e.target.value)}
          />
          <br />
          <button
            className="btn"
            onClick={() => {
              handleButtonClick();
              handleQuizSubmit();
            }}
          >
            Submit Code ✅
          </button>
        </div>
      )}

      {gameState === 'result' && (
        <div className="screen">
          <h2 className="text-neon-green animate-flicker">Mission Report 📊</h2>
          {renderStars()}
          <p className="text-neon-green">
            Game Score: {gameScore} points<br />
            Quiz Score: {stars * 10} points<br />
            Total Score: {gameScore + stars * 10} points<br />
            {stars === 3 ? 'Elite Hacker! 🥇' : 'Retry for max points! 🔄'}
          </p>
          <div className="button-container">
            <button
              className="btn"
              onClick={handleRestart}
            >
              Replay Mission 🔄
            </button>
            <button
              className="btn"
              onClick={() => {
                handleButtonClick();
                handleNextLevel();
              }}
            >
              Next Level 🚀
            </button>
          </div>
        </div>
      )}

      {gameState === 'paused' && renderPauseMenu()}
    </div>
  );
}