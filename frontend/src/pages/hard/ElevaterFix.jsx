import React, { useState, useEffect } from 'react';
import elevatorImg from '../../assets/images/hardlevel17/elevator.png';
import bgMusic from '../../assets/sounds/hardlevel17/b.mp3';
import clickSound from '../../assets/sounds/hardlevel17/click.wav';
import axios from "axios";

// Singleton audio instances
let musicInstance = null;
let hasMusicStarted = false;

function Elevater() {
  const [currentFloor, setCurrentFloor] = useState(1);
  const [targetFloor, setTargetFloor] = useState(null);
  const [bugLine, setBugLine] = useState(null);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [gameScore, setGameScore] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [fixAccuracy, setFixAccuracy] = useState(0);
  const [gameState, setGameState] = useState('intro');
  const [isPaused, setIsPaused] = useState(false);

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

  const elevatorCode = [
    'function moveElevator(current, target) {',
    '  if (current < target) {',
    '    current += 2; // Bug: Skips floors',
    '  } else if (current > target) {',
    '    current -= 1;',
    '  }',
    '  return current;',
    '}'
  ];

  const correctCode = [
    'function moveElevator(current, target) {',
    '  if (current < target) {',
    '    current += 1; // Fixed: Moves one floor at a time',
    '  } else if (current > target) {',
    '    current -= 1;',
    '  }',
    '  return current;',
    '}'
  ];

  const playSound = () => {
    const audio = new Audio(clickSound);
    audio.play().catch((err) => console.log('Click sound error:', err));
  };

  const playBackgroundMusic = () => {
    if (!hasMusicStarted) {
      musicInstance = new Audio(bgMusic);
      musicInstance.loop = true;
      musicInstance.volume = 0.3;
      musicInstance.play().catch((err) => console.log('Music error:', err));
      hasMusicStarted = true;
    }
  };

  const pauseBackgroundMusic = () => {
    if (musicInstance) {
      musicInstance.pause();
    }
  };

  const resumeBackgroundMusic = () => {
    if (musicInstance) {
      musicInstance.play().catch((err) => console.log('Music error:', err));
    }
  };

  const handleMoveElevator = () => {
    if (targetFloor === null || targetFloor < 1 || targetFloor > 10) return;
    let newFloor = currentFloor;
    if (currentFloor < targetFloor) {
      newFloor += 2; // Bug
    } else if (currentFloor > targetFloor) {
      newFloor -= 1;
    }
    setCurrentFloor(newFloor);
  };

  const handleFixBug = () => {
    if (bugLine === 2) {
      setGameScore(100);
    } else {
      setGameScore(50);
    }
    setGameState('outro');
  };

  const handleQuizSubmit = () => {
    if (quizAnswer === 'Line 3') {
      setQuizScore(50);
    } else {
      setQuizScore(0);
    }
    setFixAccuracy(gameScore + (quizAnswer === 'Line 3' ? 50 : 0));
    setGameState('rating');
  };

  const resetGame = () => {
    setCurrentFloor(1);
    setTargetFloor(null);
    setBugLine(null);
    setQuizAnswer(null);
    setGameScore(0);
    setQuizScore(0);
    setFixAccuracy(0);
    setGameState('intro');
    setIsPaused(false);
  };

  const goToDashboard = () => {
    window.location.href = '/dashboard';
  };

  const goToNextLevel = () => {
    window.location.href = '/DebuggingGameApp';
  };

  const getStars = () => {
    const totalScore = gameScore + quizScore;
    if (totalScore >= 150) return '⭐⭐⭐';
    if (totalScore >= 100) return '⭐⭐';
    return '⭐';
  };

  const handlePause = () => {
    setIsPaused(true);
    pauseBackgroundMusic();
    playSound();
  };

  const handleResume = () => {
    setIsPaused(false);
    resumeBackgroundMusic();
    playSound();
  };

  useEffect(() => {
    if (gameState === "rating") {
      const totalScore = gameScore + quizScore;
      postScore("Level 14", totalScore);
    }
  }, [gameState]);

  const renderContent = () => {
    if (isPaused) {
      return (
        <div className="section pause-menu">
          <h2>Game Paused</h2>
          <button onClick={handleResume}>Resume</button>
          <button onClick={() => { playSound(); resetGame(); }}>Restart</button>
          <button onClick={() => { playSound(); goToDashboard(); }}>Back to Dashboard</button>
        </div>
      );
    }

    switch (gameState) {
      case 'intro':
        return (
          <div className="section">
            <h2>Level 21: Broken Elevator</h2>
            <p>Spot and fix logic errors in the elevator system!</p>
            <p><strong>Story:</strong> The elevator skips floors when moving up, causing chaos in the building.</p>
            <button
              onClick={() => {
                playSound();
                playBackgroundMusic();
                setGameState('gameplay');
              }}
            >
              Start Debugging
            </button>
          </div>
        );
      case 'gameplay':
        return (
          <div className="section">
            <h2>Gameplay: Fix the Elevator</h2>
            <button className="pause-button" onClick={handlePause}>Pause</button>
            <p>Current Floor: {currentFloor}</p>
            <input
              type="number"
              placeholder="Enter target floor (1-10)"
              min="1"
              max="10"
              onChange={(e) => setTargetFloor(Number(e.target.value))}
            />
            <button onClick={() => { playSound(); handleMoveElevator(); }}>Move Elevator</button>
            <h3>Elevator Code</h3>
            <pre>
              {elevatorCode.map((line, index) => (
                <div
                  key={index}
                  className={`code-line ${bugLine === index ? 'selected' : ''}`}
                  onClick={() => { playSound(); setBugLine(index); }}
                >
                  {line}
                </div>
              ))}
            </pre>
            <button onClick={() => { playSound(); handleFixBug(); }} disabled={bugLine === null}>
              Submit Fix
            </button>
          </div>
        );
      case 'outro':
        return (
          <div className="section">
            <h2>Debugging Complete!</h2>
            <p><strong>Debugging Strategies:</strong></p>
            <ul>
              <li>Trace the code execution step-by-step.</li>
              <li>Compare expected vs. actual output.</li>
              <li>Use console logs to inspect variables.</li>
            </ul>
            <h3>Fixed Code</h3>
            <pre>
              {correctCode.map((line, index) => (
                <div key={index} className="code-line">{line}</div>
              ))}
            </pre>
            <button onClick={() => { playSound(); setGameState('quiz'); }}>Take Quiz</button>
          </div>
        );
      case 'quiz':
        return (
          <div className="section">
            <h2>Quiz: Spot the Bug</h2>
            <button className="pause-button" onClick={handlePause}>Pause</button>
            <p>Which line in the original code caused the elevator to skip floors?</p>
            {elevatorCode.map((line, index) => (
              <label key={index} className="quiz-option">
                <input
                  type="radio"
                  name="quiz"
                  value={`Line ${index + 1}`}
                  onChange={(e) => { playSound(); setQuizAnswer(e.target.value); }}
                />
                {`Line ${index + 1}: ${line}`}
              </label>
            ))}
            <button onClick={() => { playSound(); handleQuizSubmit(); }} disabled={!quizAnswer}>
              Submit Answer
            </button>
          </div>
        );
      case 'rating':
        return (
          <div className="section">
            <h2>Level Complete!</h2>
            <p><strong>Game Score:</strong> {gameScore} / 100</p>
            <p><strong>Quiz Score:</strong> {quizScore} / 50</p>
            <p><strong>Total Score:</strong> {gameScore + quizScore} / 150</p>
            <p><strong>Fix Accuracy:</strong> {fixAccuracy}%</p>
            <div className="stars">Your Rating: {getStars()}</div>
            <p>{fixAccuracy === 150 ? 'Perfect! You nailed the bug and quiz!' : 'Good job! Review the strategies to improve.'}</p>
            <button onClick={() => { playSound(); resetGame(); }}>Try Again</button>
            <button onClick={() => { playSound(); goToDashboard(); }}>Back to Dashboard</button>
            <button onClick={() => { playSound(); goToNextLevel(); }}>Next Level</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="elevater-wrapper">
      <div className="elevater-game-container">
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700&display=swap');

            body {
              margin: 0;
              padding: 0;
              font-family: 'Orbitron', 'Courier New', monospace;
              background-color: #000000;
              color: #e94560;
              height: 100vh;
              width: 100vw;
              overflow: hidden;
            }

            .elevater-wrapper {
              background: url(${elevatorImg}) no-repeat center center;
              background-size: cover;
              background-color: #000000;
              min-height: 100vh;
              width: 100%;
              display: flex;
              flex-direction: column;
            }

            .elevater-wrapper .elevater-game-container {
              background: rgba(15, 52, 96, 0.85);
              border-radius: 0;
              padding: 2vw;
              box-shadow: 0 0 20px rgba(233, 69, 96, 0.5);
              width: 100%;
              max-width: 100%;
              min-height: 100vh;
              text-align: center;
              box-sizing: border-box;
              overflow-y: auto;
              position: relative;
              display: flex;
              flex-direction: column;
            }

            .elevater-wrapper .section {
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              padding: 3vw;
              box-sizing: border-box;
              flex-grow: 1;
            }

            .elevater-wrapper .pause-menu {
              background: rgba(26, 26, 46, 0.95);
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              z-index: 10;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
            }

            .elevater-wrapper .pause-button {
              position: fixed;
              top: 1rem;
              right: 1rem;
              margin: 0;
              padding: 0.5rem 1rem;
              font-size: clamp(0.8rem, 2.5vw, 1rem);
              z-index: 5;
            }

            .elevater-wrapper h2 {
              color: #e94560;
              text-transform: uppercase;
              letter-spacing: 0.2rem;
              margin-bottom: 1rem;
              font-size: clamp(1.5rem, 7vw, 3rem);
              text-shadow: 0 0 10px #e94560, 0 0 20px #e94560;
            }

            .elevater-wrapper p, .elevater-wrapper ul {
              color: #00f7ff;
              font-size: clamp(1.1rem, 4vw, 1.3rem);              line-height: 1.5;              text-shadow: 0 0 5px #00f7ff;
              margin: 0.5rem 0;
            }

            .elevater-wrapper button {
              background: #e94560;
              border: none;
              padding: clamp(0.6rem, 2vw, 0.8rem) clamp(1.2rem, 3vw, 1.5rem);
              color: #fff;
              font-size: clamp(0.9rem, 2.5vw, 1.1rem);
              font-family: 'Orbitron', sans-serif;
              border-radius: 5px;
              cursor: pointer;
              transition: all 0.3s;
              box-shadow: 0 0 10px #e94560;
              animation: neonPulse 1.5s infinite alternate;
              margin: 0.5rem;
              width: clamp(120px, 40vw, 200px);
            }

            .elevater-wrapper .section:has(> button:first-child:nth-last-child(1)), 
            .elevater-wrapper .section:has(> button:nth-child(7)),
            .elevater-wrapper .pause-menu {
              button {
                margin: 0.75rem;
              }
            }

            .elevater-wrapper button:hover {
              background: #ff6b6b;
              box-shadow: 0 0 15px #ff6b6b;
              transform: scale(1.05);
            }

            .elevater-wrapper button:disabled {
              background: #555;
              box-shadow: none;
              cursor: not-allowed;
              animation: none;
            }

            .elevater-wrapper input[type="number"] {
              padding: 0.6rem;
              margin: 0.5rem;
              border: 2px solid #e94560;
              background: rgba(26, 26, 46, 0.8);
              color: #00f7ff;
              font-size: clamp(0.9rem, 2.5vw, 1.1rem);
              font-family: 'Orbitron', sans-serif;
              border-radius: 5px;
              width: clamp(120px, 40vw, 150px);
              box-shadow: 0 0 10px #e94560;
              transition: box-shadow 0.3s;
            }

            .elevater-wrapper input[type="number"]:focus {
              box-shadow: 0 0 15px #e94560;
              outline: none;
            }

            .elevater-wrapper pre {
              background: rgba(26, 26, 46, 0.9);
              padding: 1rem;
              border-radius: 8px;
              text-align: left;
              color: #00f7ff;
              font-size: clamp(0.8rem, 2.5vw, 1rem);
              font-family: 'Orbitron', monospace;
              overflow-x: auto;
              max-width: 90%;
              box-shadow: 0 0 10px #00f7ff;
              margin: 0.5rem 0;
            }

            .elevater-wrapper .code-line {
              padding: 0.3rem;
              cursor: pointer;
              transition: all 0.2s;
              text-shadow: 0 0 5px #00f7ff;
            }

            .elevater-wrapper .code-line:hover {
              background: #e94560;
              text-shadow: 0 0 10px #e94560;
            }

            .elevater-wrapper .selected {
              background: #ff6b6b !important;
              box-shadow: 0 0 10px #ff6b6b;
              text-shadow: 0 0 10px #ff6b6b;
            }

            .elevater-wrapper .quiz-option {
              display: flex;
              align-items: center;
              margin: 0.5rem 0;
              color: #00f7ff;
              font-size: clamp(0.8rem, 2.5vw, 1rem);
              text-shadow: 0 0 5px #00f7ff;
            }

            .elevater-wrapper .quiz-option input[type="radio"] {
              transform: scale(0.8);
              margin-right: 0.5rem;
              accent-color: #e94560;
              filter: drop-shadow(0 0 5px #e94560);
            }

            .elevater-wrapper .stars {
              font-size: clamp(1.5rem, 5vw, 2rem);
              color: #ffeb3b;
              margin: 0.5rem 0;
              text-shadow: 0 0 10px #ffeb3b;
            }

            @keyframes neonPulse {
              0% { box-shadow: 0 0 8px #e94560; }
              100% { box-shadow: 0 0 12px #e94560; }
            }

            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }

            /* Mobile-specific adjustments */
            @media screen and (max-width: 768px) {
              .elevater-wrapper .elevater-game-container {
                padding: 3vw;
              }

              .elevater-wrapper .section {
                padding: 4vw;
              }

              .elevater-wrapper h2 {
                font-size: clamp(1.5rem, 5vw, 1.8rem);
                letter-spacing: 0.15rem;
              }

              .elevater-wrapper p, .elevater-wrapper ul {
                font-size: clamp(1rem, 4vw, rem);
              }

              .elevater-wrapper button {
                padding: clamp(0.5rem, 2.5vw, 0.7rem) clamp(1rem, 4vw, 1.2rem);
                font-size: clamp(0.8rem, 3vw, 0.95rem);
                width: clamp(100px, 60vw, 160px);
              }

              .elevater-wrapper input[type="number"] {
                width: clamp(100px, 60vw, 130px);
                font-size: clamp(0.8rem, 3vw, 0.95rem);
                padding: 0.5rem;
              }

              .elevater-wrapper pre {
                font-size: clamp(0.7rem, 2.8vw, 0.9rem);
                padding: 0.8rem;
                max-width: 95%;
              }

              .elevater-wrapper .pause-button {
                top: 0.5rem;
                right: 0.5rem;
                padding: 0.4rem 0.8rem;
                font-size: clamp(0.7rem, 2.5vw, 0.9rem);
              }

              .elevater-wrapper .quiz-option {
                font-size: clamp(0.7rem, 2.8vw, 0.9rem);
                margin: 0.4rem 0;
              }
            }

            @media screen and (max-width: 480px) {
              .elevater-wrapper .elevater-game-container {
                padding: 4vw;
              }

              .elevater-wrapper .section {
                padding: 5vw;
              }

              .elevater-wrapper h2 {
                font-size: clamp(1rem, 4.8vw, 1.4rem);
              }

              .elevater-wrapper button {
                width: clamp(90px, 70vw, 140px);
                margin: 0.4rem;
              }

              .elevater-wrapper .section:has(> button:first-child:nth-last-child(1)), 
              .elevater-wrapper .section:has(> button:nth-child(7)),
              .elevater-wrapper .pause-menu {
                button {
                  margin: 0.6rem;
                }
              }

              .elevater-wrapper input[type="number"] {
                width: clamp(90px, 70vw, 120px);
              }

              .elevater-wrapper pre {
                max-width: 98%;
              }
            }
          `}
        </style>
        {renderContent()}
      </div>
    </div>
  );
}

export default Elevater;