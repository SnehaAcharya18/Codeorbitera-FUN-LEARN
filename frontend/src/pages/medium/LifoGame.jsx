import React, { useState, useEffect, useRef } from 'react';
import b8 from '../../assets/sounds/level11/b8.mp3';
import c from '../../assets/sounds/level11/c.mp3';
import spell from '../../assets/sounds/level11/spell.mp3';
import axios from "axios";

const runes = [
  { id: 1, symbol: '🔥', name: 'Fire', color: '#ff4500' },
  { id: 2, symbol: '🌊', name: 'Water', color: '#00b7eb' },
  { id: 3, symbol: '⚡', name: 'Thunder', color: '#ffd700' },
  { id: 4, symbol: '🌿', name: 'Earth', color: '#228b22' },
  { id: 5, symbol: '✨', name: 'Star', color: '#e6e6fa' },
];

const quizQuestions = [
  {
    question: 'What is the top element of a stack?',
    options: ['First added', 'Last added', 'Any'],
    answer: 'Last added',
  },
  {
    question: 'Which data structure allows only LIFO operations?',
    options: ['Queue', 'Stack', 'Array'],
    answer: 'Stack',
  },
  {
    question: 'What would be the pop order if you push A, B, C?',
    options: ['A, B, C', 'C, B, A', 'B, A, C'],
    answer: 'C, B, A',
  },
];

const LifoGame = () => {
  const [gameState, setGameState] = useState('intro');
  const [stack, setStack] = useState([]);
  const [currentRuneIndex, setCurrentRuneIndex] = useState(0);
  const [currentDoor, setCurrentDoor] = useState(5);
  const [timeLeft, setTimeLeft] = useState(90);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState(null);
  const [transition, setTransition] = useState(false);
  const [level, setLevel] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  // Audio refs
  const backgroundMusicRef = useRef(new Audio(b8));
  const clickSoundRef = useRef(new Audio(c));
  const spellSoundRef = useRef(new Audio(spell));

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
    if (gameState === "complete") {
      postScore("Level 10", score);
    }
  }, [gameState]);

  useEffect(() => {
    backgroundMusicRef.current.loop = true;
    backgroundMusicRef.current.volume = 0.3;

    setTransition(true);
    setTimeout(() => setTransition(false), 500);

    if (isPaused) {
      backgroundMusicRef.current.pause();
    } else if (['intro', 'collect', 'escape', 'outro', 'quiz', 'complete'].includes(gameState)) {
      backgroundMusicRef.current.play().catch((e) => console.log('Background music play failed:', e));
    } else {
      backgroundMusicRef.current.pause();
    }

    if ((gameState === 'collect' || gameState === 'escape') && !isPaused) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) {
            setGameState('gameOver');
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }

    return () => {
      backgroundMusicRef.current.pause();
      backgroundMusicRef.current.currentTime = 0;
    };
  }, [gameState, isPaused]);

  const playClickSound = () => {
    clickSoundRef.current.currentTime = 0;
    clickSoundRef.current.volume = 0.5;
    clickSoundRef.current.play().catch((e) => console.log('Click sound play failed:', e));
  };

  const playSpellSound = () => {
    spellSoundRef.current.currentTime = 0;
    spellSoundRef.current.volume = 0.7;
    spellSoundRef.current.play().catch((e) => console.log('Spell sound play failed:', e));
  };

  const handleCollectRune = (rune) => {
    if (isPaused) return;
    playSpellSound();
    setStack([...stack, rune]);
    setCurrentRuneIndex(currentRuneIndex + 1);
    setScore(score + 10);
    if (currentRuneIndex + 1 >= runes.length) {
      setGameState('escape');
    }
  };

  const handlePopRune = (rune) => {
    if (isPaused) return;
    playClickSound();
    if (stack.length === 0 || stack[stack.length - 1].id !== rune.id) {
      setMistakes(mistakes + 1);
      setShowFeedback('wrong');
      setTimeout(() => setShowFeedback(null), 1000);
      return;
    }
    playSpellSound();
    setStack(stack.slice(0, -1));
    setCurrentDoor(currentDoor - 1);
    setScore(score + 20);
    setShowFeedback('correct');
    setTimeout(() => setShowFeedback(null), 1000);
    if (currentDoor - 1 === 0) {
      setGameState('outro');
    } else {
      setGameState('escape');
    }
  };

  const handleQuizAnswer = (questionIndex, option) => {
    if (isPaused) return;
    playClickSound();
    setQuizAnswers({ ...quizAnswers, [questionIndex]: option });
    if (Object.keys(quizAnswers).length + 1 === quizQuestions.length) {
      let correctAnswers = 0;
      quizQuestions.forEach((q, i) => {
        if (quizAnswers[i] === q.answer || (i === questionIndex && option === q.answer)) {
          correctAnswers++;
        }
      });
      setScore(score + correctAnswers * 20);
      setGameState('complete');
    }
  };

  const handleNextLevel = () => {
    playClickSound();
    window.location.href = '/DebugGame';
  };

  const handlePause = () => {
    playClickSound();
    setIsPaused(true);
  };

  const handleResume = () => {
    playClickSound();
    setIsPaused(false);
  };

  const handleRestart = () => {
    playClickSound();
    setStack([]);
    setCurrentRuneIndex(0);
    setCurrentDoor(5);
    setTimeLeft(90);
    setScore(0);
    setMistakes(0);
    setQuizAnswers({});
    setShowFeedback(null);
    setGameState('intro');
    setIsPaused(false);
  };

  const handleDashboard = () => {
    playClickSound();
    window.location.href = '/dashboard';
    setIsPaused(false);
  };

  const getStars = () => {
    if (mistakes === 0 && timeLeft > 30) return 3;
    if (mistakes <= 1 || timeLeft > 0) return 2;
    return 1;
  };

  return (
    <div className="app">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Roboto:wght@400;700&display=swap');

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Roboto', sans-serif;
            background: url('src/assets/b8.png') no-repeat center center fixed;
            background-size: cover;
            overflow: hidden;
            height: 100vh;
            width: 100vw;
          }

          .app {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background: rgba(26, 26, 46, 0.85);
            transition: opacity 0.5s ease-in-out;
            opacity: ${transition ? 0 : 1};
            padding: clamp(8px, 1vw, 12px);
          }

          .container {
            background: linear-gradient(135deg, rgba(22, 33, 62, 0.95), rgba(44, 62, 80, 0.95));
            border: 3px solid #8a2be2;
            border-radius: 15px;
            padding: clamp(8px, 1vw, 12px);
            max-width: 95vw;
            max-height: 95vh;
            box-shadow: 0 0 30px rgba(138, 43, 226, 0.9);
            animation: fadeIn 0.8s ease-in;
            position: relative;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            z-index: 1;
          }

          .container.quiz {
            max-height: 95vh;
            padding: clamp(8px, 1vw, 12px);
          }

          .container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(138, 43, 226, 0.25), transparent);
            opacity: 0.6;
            z-index: 0;
          }

          .pause-menu {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10;
          }

          .pause-container {
            background: linear-gradient(135deg, rgba(22, 33, 62, 0.95), rgba(44, 62, 80, 0.95));
            border: 3px solid #8a2be2;
            border-radius: 15px;
            padding: clamp(16px, 2vw, 24px);
            max-width: clamp(300px, 50vw, 400px);
            box-shadow: 0 0 30px rgba(138, 43, 226, 0.9);
            animation: fadeIn 0.5s ease-in;
            display: flex;
            flex-direction: column;
            align-items: center;
            z-index: 11;
          }

          h1, h2 {
            font-family: 'Cinzel', serif;
            color: #e6e6fa;
            text-shadow: 0 0 12px #8a2be2, 0 0 24px #8a2be2;
            margin-bottom: clamp(8px, 1vw, 12px);
            font-size: clamp(32px, 4vw, 48px);
            z-index: 1;
            position: relative;
          }

          .container.quiz h2 {
            font-size: clamp(28px, 3vw, 36px);
            margin-bottom: clamp(8px, 1vw, 12px);
          }

          h3 {
            font-family: 'Cinzel', serif;
            color: #d3d3d3;
            font-size: clamp(20px, 1.5vw, 24px);
            margin-bottom: clamp(8px, 1vw, 12px);
            z-index: 1;
            position: relative;
          }

          p {
            font-size: clamp(18px, 2vw, 24px);
            color: #e0e0e0;
            text-shadow: 0 0 8px #000;
            margin: clamp(8px, 1vw, 12px) 0;
            z-index: 1;
            position: relative;
            line-height: 1.5;
            max-width: 90vw;
          }

          button {
            background: linear-gradient(45deg, #8a2be2, #4b0082);
            color: #fff;
            border: none;
            padding: clamp(8px, 1vw, 12px) clamp(16px, 2vw, 24px);
            margin: clamp(4px, 0.5vw, 8px);
            border-radius: 8px;
            cursor: pointer;
            font-size: clamp(16px, 1.2vw, 20px);
            font-family: 'Roboto', sans-serif;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 0 15px rgba(138, 43, 226, 0.6);
            z-index: 1;
            position: relative;
          }

          button:hover {
            transform: scale(1.05);
            box-shadow: 0 0 25px rgba(138, 43, 226, 1);
          }

          button:active {
            transform: scale(0.95);
          }

          .pause-button {
            background: linear-gradient(45deg, #ff4500, #8b0000);
            position: absolute;
            top: clamp(8px, 1vw, 12px);
            right: clamp(8px, 1vw, 12px);
            padding: clamp(6px, 0.8vw, 10px) clamp(12px, 1.2vw, 16px);
            font-size: clamp(16px, 1.2vw, 20px);
          }

          .stack {
            display: flex;
            flex-direction: column-reverse;
            align-items: center;
            min-height: clamp(150px, 25vh, 200px);
            background: rgba(0, 0, 0, 0.4);
            border-radius: 10px;
            padding: clamp(8px, 1vw, 12px);
            box-shadow: inset 0 0 20px rgba(138, 43, 226, 0.5);
            position: relative;
            z-index: 1;
            width: clamp(100px, 20vw, 150px);
            gap: clamp(4px, 0.5vw, 8px);
            overflow: visible;
          }

          .rune {
            font-size: clamp(24px, 2.5vw, 32px);
            padding: clamp(12px, 1.5vw, 16px);
            margin: clamp(4px, 0.5vw, 8px);
            border-radius: 50%;
            transition: transform 0.3s, box-shadow 0.3s;
            animation: pulse 2s infinite;
            position: relative;
            z-index: 2;
            width: clamp(60px, 8vw, 80px);
            height: clamp(60px, 8vw, 80px);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .stack-rune {
            animation: slideIn 0.6s ease-in-out, pulse 2s infinite;
          }

          .rune-selection {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: clamp(8px, 1vw, 12px);
            margin-top: clamp(8px, 1vw, 12px);
            z-index: 1;
            position: relative;
            max-width: 90vw;
          }

          .rune-button {
            font-size: clamp(24px, 2.5vw, 32px);
            width: clamp(60px, 8vw, 80px);
            height: clamp(60px, 8vw, 80px);
            border-radius: 50%;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s, box-shadow 0.2s;
          }

          .rune-button:hover {
            transform: scale(1.15);
            box-shadow: 0 0 25px rgba(138, 43, 226, 1);
          }

          .quiz-container {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: center;
            gap: clamp(8px, 1vw, 12px);
            width: 100%;
            max-height: 80vh;
            overflow-y: auto;
            z-index: 1;
            position: relative;
          }

          .quiz-question {
            flex: 1;
            max-width: clamp(200px, 30vw, 300px);
            margin: clamp(8px, 1vw, 12px);
            padding: clamp(8px, 1vw, 12px);
            background: rgba(0, 0, 0, 0.5);
            border-radius: 10px;
            box-shadow: 0 0 15px rgba(138, 43, 226, 0.4);
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            z-index: 1;
            position: relative;
          }

          .quiz-question p {
            font-size: clamp(16px, 1.5vw, 20px);
            margin-bottom: clamp(8px, 1vw, 12px);
          }

          .quiz-button {
            width: 100%;
            margin: clamp(4px, 0.5vw, 8px) 0;
            padding: clamp(8px, 1vw, 12px);
            font-size: clamp(14px, 1vw, 18px);
            transition: transform 0.2s, background 0.2s;
          }

          .quiz-button:hover {
            transform: scale(1.05);
            background: linear-gradient(45deg, #6a1bb2, #8a2be2);
          }

          .quiz-button:disabled {
            background: #555;
            cursor: not-allowed;
            box-shadow: none;
          }

          .feedback {
            font-size: clamp(20px, 1.5vw, 24px);
            font-weight: bold;
            margin-top: clamp(8px, 1vw, 12px);
            text-shadow: 0 0 10px #000;
            z-index: 1;
            position: relative;
          }

          .instructions {
            background: rgba(0, 0, 0, 0.6);
            padding: clamp(8px, 1vw, 12px);
            border-radius: 8px;
            margin: clamp(8px, 1vw, 12px) 0;
            box-shadow: 0 0 10px rgba(138, 43, 226, 0.3);
            max-width: 90vw;
          }

          .instructions h3 {
            font-size: clamp(20px, 1.5vw, 24px);
            margin-bottom: clamp(8px, 1vw, 12px);
          }

          .instructions p {
            font-size: clamp(18px, 2vw, 24px);
            color: #d3d3d3;
            text-align: left;
            margin: clamp(4px, 0.5vw, 8px) 0;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes slideIn {
            from { transform: translateY(-40px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }

          @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 0 10px rgba(138, 43, 226, 0.6); }
            50% { transform: scale(1.05); box-shadow: 0 0 20px rgba(138, 43, 226, 1); }
            100% { transform: scale(1); box-shadow: 0 0 10px rgba(138, 43, 226, 0.6); }
          }

          @keyframes glow {
            0% { box-shadow: 0 0 5px #00ff00; }
            50% { box-shadow: 0 0 25px #00ff00; }
            100% { box-shadow: 0 0 5px #00ff00; }
          }

          @keyframes glowStack {
            0% { box-shadow: inset 0 0 10px #00ff00; }
            50% { box-shadow: inset 0 0 30px #00ff00; }
            100% { box-shadow: inset 0 0 10px #00ff00; }
          }

          @keyframes shake {
            0% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            50% { transform: translateX(10px); }
            75% { transform: translateX(-10px); }
            100% { transform: translateX(0); }
          }

          @keyframes shatter {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.1); }
            100% { opacity: 0; transform: scale(1.2); }
          }

          @media (max-width: 768px) {
            .app {
              padding: clamp(4px, 1vw, 8px);
            }
            .container {
              padding: clamp(4px, 1vw, 8px);
              max-width: 95vw;
              max-height: 95vh;
            }
            .container.quiz {
              padding: clamp(4px, 1vw, 8px);
              max-height: 95vh;
            }
            .pause-container {
              padding: clamp(8px, 2vw, 16px);
              max-width: clamp(250px, 80vw, 320px);
            }
            h1, h2 {
              font-size: clamp(28px, 4vw, 36px);
            }
            .container.quiz h2 {
              font-size: clamp(24px, 3vw, 30px);
            }
            h3 {
              font-size: clamp(18px, 1.5vw, 22px);
            }
            p {
              font-size: clamp(16px, 2vw, 20px);
            }
            button {
              font-size: clamp(14px, 1.2vw, 18px);
              padding: clamp(6px, 1vw, 10px) clamp(12px, 1.5vw, 16px);
            }
            .pause-button {
              top: clamp(4px, 1vw, 8px);
              right: clamp(4px, 1vw, 8px);
              padding: clamp(4px, 0.8vw, 8px) clamp(8px, 1.2vw, 12px);
              font-size: clamp(14px, 1.2vw, 18px);
            }
            .stack {
              min-height: clamp(120px, 20vh, 150px);
              width: clamp(80px, 15vw, 120px);
              padding: clamp(4px, 1vw, 8px);
              gap: clamp(2px, 0.5vw, 4px);
            }
            .rune {
              font-size: clamp(20px, 2.5vw, 28px);
              padding: clamp(8px, 1vw, 12px);
              margin: clamp(2px, 0.5vw, 4px);
              width: clamp(50px, 7vw, 60px);
              height: clamp(50px, 7vw, 60px);
            }
            .rune-button {
              font-size: clamp(20px, 2.5vw, 28px);
              width: clamp(50px, 7vw, 60px);
              height: clamp(50px, 7vw, 60px);
            }
            .rune-selection {
              gap: clamp(4px, 1vw, 8px);
              margin-top: clamp(4px, 1vw, 8px);
              max-width: 95vw;
            }
            .quiz-container {
              flex-direction: column;
              gap: clamp(4px, 1vw, 8px);
              max-height: 85vh;
            }
            .quiz-question {
              max-width: 95vw;
              margin: clamp(4px, 1vw, 8px);
              padding: clamp(4px, 1vw, 8px);
            }
            .quiz-question p {
              font-size: clamp(14px, 1.5vw, 18px);
            }
            .quiz-button {
              font-size: clamp(12px, 1vw, 16px);
              padding: clamp(6px, 1vw, 10px);
            }
            .feedback {
              font-size: clamp(18px, 1.5vw, 22px);
              margin-top: clamp(4px, 1vw, 8px);
            }
            .instructions {
              padding: clamp(4px, 1vw, 8px);
              margin: clamp(4px, 1vw, 8px) 0;
            }
            .instructions p {
              font-size: clamp(16px, 2vw, 20px);
            }
          }
        `}
      </style>

      {isPaused && (
        <div className="pause-menu">
          <div className="pause-container">
            <h2>Game Paused</h2>
            <button onClick={handleResume}>Resume</button>
            <button onClick={handleRestart}>Restart</button>
            <button onClick={handleDashboard}>Dashboard</button>
          </div>
        </div>
      )}

      {gameState === 'dashboard' && (
        <div className="container dashboard">
          <h1>The Sorcerer’s Stack</h1>
          <p>Embark on a mystical journey through the Crystal Crypt!</p>
          <button onClick={() => { playClickSound(); setGameState('intro'); }}>
            Start Quest
          </button>
        </div>
      )}

      {gameState === 'intro' && (
        <div className="container intro">
          <button
            className="pause-button"
            onClick={handlePause}
          >
            Pause
          </button>
          <h1>The Sorcerer’s Stack</h1>
          <p>Trapped in the Crystal Crypt, master the stack of runes to escape!</p>
          <div className="instructions">
            <h3>How to Play</h3>
            <p>1. Collect runes in a stack (Last In, First Out).</p>
            <p>2. Pop runes to match spells and unlock doors.</p>
            <p>3. Answer quiz questions to prove your mastery.</p>
            <p>4. Earn points and stars based on time and mistakes.</p>
          </div>
          <button onClick={() => { playClickSound(); setGameState('collect'); }}>
            Begin Quest
          </button>
        </div>
      )}

      {gameState === 'collect' && (
        <div className="container collect">
          <button
            className="pause-button"
            onClick={handlePause}
          >
            Pause
          </button>
          <h2>Collect Mystical Runes</h2>
          <p>Time: {timeLeft}s | Score: {score} | Level: {level}</p>
          <div className="instructions">
            <p>Click the glowing {runes[currentRuneIndex]?.name} Rune to add it.</p>
          </div>
          <div className="stack">
            {stack.map((rune, index) => (
              <div
                key={index}
                className="rune stack-rune"
                style={{ background: rune.color, boxShadow: `0 0 15px ${rune.color}` }}
              >
                {rune.symbol}
              </div>
            ))}
          </div>
          {currentRuneIndex < runes.length && (
            <div className="rune-selection">
              <p>Seek the {runes[currentRuneIndex].name} Rune!</p>
              <button
                className="rune-button"
                style={{ background: runes[currentRuneIndex].color, boxShadow: `0 0 15px ${runes[currentRuneIndex].color}` }}
                onClick={() => handleCollectRune(runes[currentRuneIndex])}
              >
                {runes[currentRuneIndex].symbol}
              </button>
            </div>
          )}
        </div>
      )}

      {gameState === 'escape' && (
        <div className={`container escape ${showFeedback}`}>
          <button
            className="pause-button"
            onClick={handlePause}
          >
            Pause
          </button>
          <h2>Unlock Crystal Door {currentDoor}</h2>
          <p>Time: {timeLeft}s | Score: {score} | Level: {level}</p>
          <div className="instructions">
            <p>Pop the top rune by selecting the matching symbol.</p>
          </div>
          <div className="stack">
            {stack.map((rune, index) => (
              <div
                key={index}
                className="rune stack-rune"
                style={{ background: rune.color, boxShadow: `0 0 15px ${rune.color}` }}
              >
                {rune.symbol}
              </div>
            ))}
          </div>
          <div className="rune-selection">
            <p>Choose the top rune:</p>
            {runes.map((rune) => (
              <button
                key={rune.id}
                className="rune-button"
                style={{ background: rune.color, boxShadow: `0 0 15px ${rune.color}` }}
                onClick={() => handlePopRune(rune)}
              >
                {rune.symbol}
              </button>
            ))}
          </div>
          {showFeedback && (
            <>
              <p className={`feedback ${showFeedback}`}>
                {showFeedback === 'correct' ? 'Rune Accepted!' : 'Wrong Rune!'}
              </p>
              {showFeedback === 'correct' && <div className="door-unlock" />}
            </>
          )}
        </div>
      )}

      {gameState === 'outro' && (
        <div className="container outro">
          <button
            className="pause-button"
            onClick={handlePause}
          >
            Pause
          </button>
          <h2>The Final Challenge</h2>
          <p>The last door shatters. Prove your worth at the Altar of Knowledge!</p>
          <button onClick={() => { playClickSound(); setGameState('quiz'); }}>
            Face the Quiz
          </button>
        </div>
      )}

      {gameState === 'quiz' && (
        <div className="container quiz">
          <button
            className="pause-button"
            onClick={handlePause}
          >
            Pause
          </button>
          <h2>Master the Stack</h2>
          <div className="instructions">
            <p>Select the correct answer for each question.</p>
          </div>
          <div className="quiz-container">
            {quizQuestions.map((q, index) => (
              <div key={index} className="quiz-question">
                <p>{q.question}</p>
                {q.options.map((option) => (
                  <button
                    key={option}
                    className="quiz-button"
                    onClick={() => handleQuizAnswer(index, option)}
                    disabled={quizAnswers[index]}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {gameState === 'complete' && (
        <div className="container complete">
          <button
            className="pause-button"
            onClick={handlePause}
          >
            Pause
          </button>
          <h2>Victory, Rune Seeker!</h2>
          <p>Level: {level}</p>
          <p>You’ve conquered the Crystal Crypt!</p>
          <p>Score: {score}</p>
          <p>Stars: {'⭐'.repeat(getStars())}</p>
          <div>
            <button onClick={() => { playClickSound(); setGameState('intro'); }}>
              Replay Quest
            </button>
            <button onClick={handleNextLevel}>
              Next Level
            </button>
          </div>
        </div>
      )}

      {gameState === 'gameOver' && (
        <div className="container game-over">
          <button
            className="pause-button"
            onClick={handlePause}
          >
            Pause
          </button>
          <h2>Time’s Up!</h2>
          <p>The Crypt Guardian awakens...</p>
          <p>Score: {score}</p>
          <button onClick={() => { playClickSound(); setGameState('intro'); }}>
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default LifoGame;