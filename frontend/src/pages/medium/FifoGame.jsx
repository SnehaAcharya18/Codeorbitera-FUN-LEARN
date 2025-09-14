
import React, { useState, useEffect, useRef } from 'react';
import backgroundMusic from '../../assets/sounds/midlevel3/b6.mp3';
import clickSound from '../../assets/sounds/midlevel3/cl.wav';
import dockSound from '../../assets/sounds/midlevel3/sel.mp3';
import axios from "axios";

const FifoGame = () => {
  const [step, setStep] = useState('intro');
  const [queue, setQueue] = useState([]);
  const [inputShip, setInputShip] = useState('');
  const [dockedShips, setDockedShips] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [quizAnswer, setQuizAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const [gamePoints, setGamePoints] = useState(0);
  const [quizPoints, setQuizPoints] = useState(0);
  const [nextLevel, setNextLevel] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Audio refs
  const bgMusicRef = useRef(new Audio(backgroundMusic));
  const clickSoundRef = useRef(new Audio(clickSound));
  const dockSoundRef = useRef(new Audio(dockSound));

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
    if (step === "rating") {
      const total = gamePoints + quizPoints;
      postScore("Level 8", total);
    }
  }, [step]);

  useEffect(() => {
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = 0.3;
    bgMusicRef.current.play().catch((error) => {
      console.log('Background music autoplay prevented:', error);
    });

    return () => {
      bgMusicRef.current.pause();
      bgMusicRef.current.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    if (step === 'game') {
      const totalActions = queue.length + dockedShips.length;
      const maxActions = 10;
      const newProgress = (totalActions / maxActions) * 100;
      setProgress(newProgress);
      console.log('Progress updated:', newProgress, '%'); // Debug log
    }
  }, [queue, dockedShips, step]);

  useEffect(() => {
    if (isPaused) {
      bgMusicRef.current.pause();
    } else {
      bgMusicRef.current.play().catch((error) => {
        console.log('Background music resume prevented:', error);
      });
    }
  }, [isPaused]);

  const playClickSound = () => {
    clickSoundRef.current.currentTime = 0;
    clickSoundRef.current.volume = 0.5;
    clickSoundRef.current.play().catch((error) => {
      console.log('Click sound error:', error);
    });
  };

  const handleStartGame = () => {
    playClickSound();
    setStep('game');
    setQueue([]);
    setDockedShips([]);
    setGamePoints(0);
    setQuizPoints(0);
    setStartTime(Date.now());
    setNextLevel(false);
    setIsPaused(false);
  };

  const addToQueue = () => {
    if (!inputShip || isPaused) return;
    playClickSound();
    setQueue([...queue, inputShip.toUpperCase()]);
    setGamePoints(gamePoints + 10);
    setInputShip('');
  };

  const dockNextShip = () => {
    if (queue.length === 0 || isPaused) return;
    playClickSound();
    dockSoundRef.current.currentTime = 0;
    dockSoundRef.current.volume = 0.7;
    dockSoundRef.current.play().catch((error) => {
      console.log('Dock sound error:', error);
    });
    const [first, ...rest] = queue;
    setQueue(rest);
    setDockedShips([...dockedShips, first]);
    setGamePoints(gamePoints + 20);
  };

  const finishGame = () => {
    if (isPaused) return;
    playClickSound();
    setEndTime(Date.now());
    setStep('outro');
  };

  const handleQuizSubmit = () => {
    if (isPaused) return;
    playClickSound();
    if (quizAnswer.toUpperCase() === 'A') {
      setQuizPoints(50);
      setScore(3);
    } else {
      setQuizPoints(10);
      setScore(1);
    }
    setStep('rating');
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
    setStep('intro');
    setQueue([]);
    setDockedShips([]);
    setGamePoints(0);
    setQuizPoints(0);
    setStartTime(null);
    setEndTime(null);
    setQuizAnswer('');
    setScore(0);
    setProgress(0);
    setIsPaused(false);
  };

  const handleDashboard = () => {
    playClickSound();
    window.location.href = '/dashboard';
  };

  const handleNextLevel = () => {
    playClickSound();
    window.location.href = '/InsertionGame';
  };

  const handleQuizNavigation = () => {
    if (isPaused) return;
    playClickSound();
    setStep('quiz');
  };

  const totalPoints = gamePoints + quizPoints;

  return (
    <div className="app-container">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          .app-container {
            width: 100vw;
            height: 100vh;
            color: #ffffff;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            background: url('https://images.unsplash.com/photo-1465101162946-4377e57745c3') no-repeat center center fixed, linear-gradient(180deg, #1e1b4b 0%, #0d1a5e 100%);
            background-size: cover;
            font-family: 'Orbitron', sans-serif;
            position: relative;
            padding: clamp(4px, 0.8vw, 8px);
            overflow: hidden;
          }

          .nebula {
            position: absolute;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%);
            opacity: 0.4;
            z-index: 0;
          }

          .glass-card {
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(25px);
            border: 2px solid rgba(99, 102, 241, 0.7);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7), inset 0 0 15px rgba(124, 58, 237, 0.5);
            padding: clamp(4px, 0.8vw, 8px);
            border-radius: 1.5vw;
            width: 100%;
            height: 100%;
            text-align: center;
            position: relative;
            z-index: 2;
            animation: card-shine 4s infinite ease-in-out;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }

          .glass-card.intro, .glass-card.outro, .glass-card.quiz, .glass-card.rating {
            max-width: 80vw;
            max-height: 80vh;
            margin: clamp(8px, 1.5vw, 12px) auto;
          }

          .glass-card.game {
            max-height: 100vh;
            overflow: hidden;
            padding: clamp(4px, 0.8vw, 8px);
          }

          .glass-card.game::-webkit-scrollbar {
            display: none;
          }

          @keyframes card-shine {
            0%, 100% { border-color: rgba(99, 102, 241, 0.7); box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7); }
            50% { border-color: rgba(124, 58, 237, 1); box-shadow: 0 10px 40px rgba(124, 58, 237, 0.8); }
          }

          .glass-card::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            animation: card-reflect 6s infinite linear;
            opacity: 0.3;
          }

          @keyframes card-reflect {
            0% { transform: translateX(-100%) rotate(45deg); }
            100% { transform: translateX(100%) rotate(45deg); }
          }

          .neon-button {
            padding: clamp(12px, 2vw, 15px);
            border: none;
            border-radius: 0.8vw;
            color: #ffffff;
            font-size: clamp(20px, 2vw, 24px);
            font-weight: 700;
            cursor: pointer;
            position: relative;
            text-shadow: 0 0 0.6vw #a5b4fc;
            background: linear-gradient(45deg, #6366f1, #a855f7);
            overflow: hidden;
            z-index: 2;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            width: 100%;
            max-width: 25vw;
            align-items: center;
          }

          .neon-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
            transition: left 0.4s ease;
                        align-items: center;

          }

          .neon-button:hover::before {
            left: 100%;
          }

          .neon-button:hover {
            transform: scale(1.15) translateY(-0.2vw);
            box-shadow: 0 0 2vw #a855f7, 0 0 4vw #6366f1;
          }

          .neon-button:disabled {
            cursor: not-allowed;
            opacity: 0.6;
          }

          .neon-input {
            padding: clamp(8px, 1vw, 12px);
            border-radius: 0.8vw;
            border: 2px solid #a5b4fc;
            background: rgba(255, 255, 255, 0.1);
            color: #ffffff;
            font-size: clamp(20px, 2vw, 24px);
            font-weight: 500;
            transition: all 0.3s ease;
            width: 100%;
            max-width: 25vw;
            text-shadow: 0 0 0.4vw #a5b4fc;
            animation: input-glow 3s infinite ease-in-out;
          }

          @keyframes input-glow {
            0%, 100% { border-color: #a5b4fc; }
            50% { border-color: #a855f7; }
          }

          .neon-input:focus {
            outline: none;
            box-shadow: 0 0 1.5vw #a855f7, 0 0 3vw #6366f1;
            border-color: #a855f7;
            transform: scale(1.02);
          }

          .neon-input:disabled {
            cursor: not-allowed;
            opacity: 0.6;
            animation: none;
          }

          .neon-input::placeholder {
            color: #c7d2fe;
            text-shadow: none;
            opacity: 0.8;
            font-weight: 400;
          }

          .ship-card {
            background: linear-gradient(45deg, #1e40af, #4f46e5);
            padding: clamp(6px, 0.8vw, 10px);
            border-radius: 0.8vw;
            box-shadow: 0 0.6vw 1.5vw rgba(0, 0, 0, 0.5), inset 0 0 0.8vw rgba(167, 139, 250, 0.6);
            display: flex;
            align-items: center;
            gap: 0.8vw;
            transition: transform 0.4s ease, box-shadow 0.4s ease;
            color: #e0e7ff;
            perspective: 1200px;
            font-weight: 600;
            font-size: clamp(20px, 2vw, 24px);
            animation: ship-enter 0.5s ease-out;
          }

          @keyframes ship-enter {
            0% { transform: translateY(1.5vw) rotateX(20deg); opacity: 0; }
            100% { transform: translateY(0) rotateX(0); opacity: 1; }
          }

          .ship-card:hover {
            transform: translateY(-0.6vw) rotateX(15deg);
            box-shadow: 0 0.8vw 2vw rgba(167, 139, 250, 0.9);
          }

          .ship-card.docked {
            background: linear-gradient(45deg, #4b5563, #6b7280);
            box-shadow: 0 0.6vw 1.5vw rgba(0, 0, 0, 0.5), inset 0 0 0.8vw rgba(209, 213, 219, 0.6);
          }

          .ship-card.docking {
            animation: flip-dock 0.7s ease forwards;
          }

          @keyframes flip-dock {
            0% { transform: rotateY(90deg) scale(0.8); opacity: 0; }
            100% { transform: rotateY(0) scale(1); opacity: 1; }
          }

          .progress-bar-container {
            width: calc(100% - 2 * clamp(4px, 0.8vw, 8px));
            height: clamp(14px, 1.4vw, 18px);
            background: rgba(17, 24, 39, 0.9);
            border-radius: 9999px;
            margin: clamp(1px, 0.3vw, 3px) auto;
            box-shadow: inset 0 0 0.6vw rgba(0, 0, 0, 0.7);
            position: relative;
            z-index: 10;
            overflow: visible;
          }

          .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #6366f1, #a855f7);
            border-radius: 9999px;
            transition: width 0.4s ease;
            box-shadow: 0 0 1vw #a855f7;
            position: relative;
            animation: progress-shimmer 2s infinite linear;
            will-change: width;
          }

          @keyframes progress-shimmer {
            0% { background-position: 0% 0; }
            100% { background-position: 200% 0; }
          }

          .progress-bar::after {
            content: '🌠';
            position: absolute;
            right: 0.6vw;
            top: -0.3vw;
            font-size: clamp(18px, 2.2vw, 22px);
            animation: comet-trail 0.8s infinite ease-in-out;
          }

          @keyframes comet-trail {
            0% { transform: translateX(0) rotate(0deg); opacity: 1; }
            50% { transform: translateX(-1vw) rotate(45deg); opacity: 0.6; }
            100% { transform: translateX(0) rotate(0deg); opacity: 1; }
          }

          .planet {
            position: absolute;
            z-index: 1;
            pointer-events: none;
            text-shadow: 0 0 1vw #ffffff, 0 0 2vw #a5b4fc;
            animation: planet-glow 5s infinite ease-in-out;
          }

          @keyframes planet-glow {
            0%, 100% { text-shadow: 0 0 1vw #ffffff, 0 0 2vw #a5b4fc; }
            50% { text-shadow: 0 0 1.5vw #ffffff, 0 0 3vw #a855f7; }
          }

          .planet-1 {
            top: 8vh;
            left: 4vw;
            font-size: clamp(20px, 4vw, 40px);
            animation: orbit 20s linear infinite;
          }

          .planet-2 {
            bottom: 12vh;
            right: 6vw;
            font-size: clamp(15px, 3vw, 30px);
            animation: orbit 15s linear infinite reverse;
          }

          .planet-3 {
            top: 18vh;
            right: 12vw;
            font-size: clamp(12px, 2.5vw, 25px);
            animation: orbit 25s linear infinite;
          }

          .planet-4 {
            bottom: 8vh;
            left: 10vw;
            font-size: clamp(17px, 3.5vw, 35px);
            animation: orbit 18s linear infinite reverse;
          }

          @keyframes orbit {
            0% { transform: rotate(0deg) translateX(3vw) rotate(0deg); }
            100% { transform: rotate(360deg) translateX(3vw) rotate(-360deg); }
          }

          .pause-button {
            position: fixed;
            top: clamp(4px, 0.8vw, 8px);
            right: clamp(4px, 0.8vw, 8px);
            padding: clamp(6px, 0.8vw, 10px) clamp(10px, 1.2vw, 14px);
            font-size: clamp(20px, 2vw, 24px);
            font-weight: 700;
            background: linear-gradient(45deg, #f472b6, #ec4899);
            z-index: 20;
            max-width: 200px;
          }

          .pause-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(10px);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 25;
          }

          .pause-menu {
            background: rgba(255, 255, 255, 0.15);
            border: 2px solid rgba(99, 102, 241, 0.7);
            border-radius: 1.5vw;
            padding: clamp(10px, 1.2vw, 14px);
            text-align: center;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7);
            animation: card-shine 4s infinite ease-in-out;
          }

          .pause-menu h2 {
            font-size: clamp(26px, 3.4vw, 34px);
            font-weight: 900;
            color: #e9d5ff;
            text-shadow: 0 0 0.8vw #a855f7;
            margin-bottom: clamp(6px, 1vw, 10px);
          }

          .button-cyan { background: linear-gradient(45deg, #6366f1, #3b82f6); }
          .button-magenta { background: linear-gradient(45deg, #a855f7, #d946ef); }
          .button-red { background: linear-gradient(45deg, #f43f5e, #dc2626); }
          .button-yellow { background: linear-gradient(45deg, #facc15, #f59e0b); }

          .text-cyan { color: #a5b4fc; text-shadow: 0 0 0.6vw #6366f1; }
          .text-magenta { color: #e9d5ff; text-shadow: 0 0 0.6vw #a855f7; }
          .text-green { color: #86efac; text-shadow: 0 0 0.6vw #22c55e; }
          .text-yellow { color: #fef9c3; text-shadow: 0 0 0.6vw #facc15; }
          .text-gray { color: #f3f4f6; text-shadow: 0 0 0.4vw #ffffff; font-size: clamp(20px, 2vw, 24px); }

          .flex-container {
            display: flex;
            gap: clamp(6px, 0.8vw, 8px);
            flex-wrap: wrap;
            justify-content: center;
          }

          .input-container {
            display: flex;
            flex-direction: column;
            gap: clamp(6px, 0.8vw, 8px);
            align-items: center;
            justify-content: flex-start;
            max-width: 25vw;
            flex: 1;
            margin-top: 15px;
          }

          .game-content {
            display: flex;
            flex-direction: row;
            gap: clamp(6px, 0.8vw, 8px);
            align-items: flex-start;
            justify-content: center;
            width: 100%;
            max-width: 95vw;
            margin: clamp(1px, 0.3vw, 3px) auto;
            flex: 1;
          }

          .instructions-card {
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(99, 102, 241, 0.5);
            border-radius: 1vw;
            padding: clamp(4px, 0.8vw, 8px);
            max-width: 70vw;
            text-align: left;
            box-shadow: 0 0 1.5vw rgba(124, 58, 237, 0.4);
            animation: instructions-glow 3s infinite ease-in-out;
            flex: 1;
            min-width: 30vw;
            margin-top: 20px;
          }

          @keyframes instructions-glow {
            0%, 100% { border-color: rgba(99, 102, 241, 0.5); }
            50% { border-color: rgba(124, 58, 237, 0.8); }
          }

          .instructions-card h3 {
            font-size: clamp(26px, 2.8vw, 30px);
            font-weight: 700;
            color: #e9d5ff;
            text-shadow: 0 0 0.6vw #a855f7;
            margin-bottom: clamp(4px, 0.6vw, 6px);
          }

          .instructions-card ul {
            list-style-type: none;
            font-size: clamp(20px, 2vw, 24px);
            font-weight: 500;
            color: #f3f4f6;
            text-shadow: 0 0 0.4vw #ffffff;
          }

          .instructions-card li {
            margin-bottom: clamp(4px, 0.6vw, 6px);
            position: relative;
            padding-left: clamp(12px, 1.2vw, 15px);
          }

          .instructions-card li::before {
            content: '🌟';
            position: absolute;
            left: -15px;
            font-size: clamp(20px, 2vw, 24px);
          }

          .section-title {
            font-size: clamp(34px, 4.2vw, 42px);
            margin: clamp(1px, 0.3vw, 3px) 0;
            font-weight: 900;
            text-shadow: 0 0 0.8vw #a5b4fc;
            animation: title-glow 3s infinite ease-in-out;
            position: relative;
            z-index: 5;
          }

          @keyframes title-glow {
            0%, 100% { text-shadow: 0 0 0.8vw #a5b4fc; }
            50% { text-shadow: 0 0 1.2vw #a5b4fc; }
          }

          .empty-state {
            color: #c7d2fe;
            font-size: clamp(20px, 2vw, 24px);
            font-weight: 500;
            text-shadow: 0 0 0.4vw #a5b4fc;
          }

          .score-breakdown {
            margin: clamp(4px, 0.8vw, 8px) auto;
            padding: clamp(4px, 0.8vw, 8px);
            background: rgba(255, 255, 255, 0.2);
            border-radius: 1vw;
            text-align: left;
            max-width: 60vw;
            border: 2px solid rgba(99, 102, 241, 0.5);
            box-shadow: 0 0 1.5vw rgba(124, 58, 237, 0.6);
            animation: score-glow 3s infinite ease-in-out;
          }

          .score-breakdown p {
            margin: clamp(4px, 0.5vw, 6px) 0;
            font-size: clamp(20px, 2vw, 24px);
            font-weight: 600;
            text-shadow: 0 0 0.4vw #ffffff;
          }

          @keyframes score-glow {
            0%, 100% { border-color: rgba(99, 102, 241, 0.5); }
            50% { border-color: rgba(124, 58, 237, 0.8); }
          }

          .button-group {
            display: flex;
            gap: clamp(6px, 0.8vw, 8px);
            justify-content: center;
            margin-top: clamp(4px, 0.8vw, 8px);
          }

          .story-card {
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(99, 102, 241, 0.5);
            border-radius: 1vw;
            padding: clamp(4px, 0.8vw, 8px);
            margin-bottom: clamp(4px, 0.8vw, 8px);
            max-width: 70vw;
            text-align: center;
            box-shadow: 0 0 1.5vw rgba(124, 58, 237, 0.4);
            animation: story-glow 3s infinite ease-in-out;
          }

          @keyframes story-glow {
            0%, 100% { border-color: rgba(99, 102, 241, 0.5); }
            50% { border-color: rgba(124, 58, 237, 0.8); }
          }

          .story-card p {
            font-size: clamp(24px, 2.4vw, 28px);
            font-weight: 500;
            color: #f3f4f6;
            text-shadow: 0 0 0.4vw #ffffff;
            line-height: 1.5;
            font-weight: bold;
          }

          .queue-explanation {
            background: linear-gradient(45deg, rgba(30, 64, 175, 0.8), rgba(79, 70, 229, 0.8));
            border: 2px solid rgba(167, 139, 250, 0.7);
            border-radius: 1vw;
            padding: clamp(4px, 0.8vw, 8px);
            margin: clamp(4px, 0.8vw, 8px) auto;
            max-width: 70vw;
            text-align: left;
            box-shadow: 0 0 2vw rgba(124, 58, 237, 0.8), inset 0 0 1vw rgba(167, 139, 250, 0.5);
            animation: queue-glow 4s infinite ease-in-out;
          }

          @keyframes queue-glow {
            0%, 100% { border-color: rgba(167, 139, 250, 0.7); box-shadow: 0 0 2vw rgba(124, 58, 237, 0.8); }
            50% { border-color: rgba(124, 58, 237, 1); box-shadow: 0 0 2vw rgba(124, 58, 237, 1); }
          }

          .queue-explanation h3 {
            font-size: clamp(24px, 2.4vw, 28px);
            font-weight: 900;
            color: #fef9c3;
            text-shadow: 0 0 0.6vw #facc15;
            margin-bottom: clamp(4px, 0.6vw, 6px);
          }

          .queue-explanation p {
            font-size: clamp(20px, 2vw, 24px);
            font-weight: 500;
            color: #e0e7ff;
            text-shadow: 0 0 0.4vw #ffffff;
            margin-bottom: clamp(4px, 0.6vw, 6px);
            line-height: 1.5;
          }

          .queue-diagram {
            display: flex;
            align-items: center;
            gap: 0.8vw;
            margin: clamp(4px, 0.6vw, 6px) 0;
            justify-content: center;
          }

          .queue-item {
            background: linear-gradient(45deg, #1e40af, #4f46e5);
            padding: clamp(5px, 0.6vw, 8px);
            border-radius: 0.6vw;
            font-size: clamp(20px, 2vw, 24px);
            font-weight: 600;
            color: #e0e7ff;
            box-shadow: 0 0 0.8vw rgba(167, 139, 250, 0.6);
          }

          .queue-arrow {
            font-size: clamp(20px, 2vw, 24px);
            color: #fef9c3;
            text-shadow: 0 0 0.6vw #facc15;
          }

          @media (max-width: 768px) {
            .glass-card { padding: clamp(4px, 0.8vw, 8px); max-width: 100vw; }
            .glass-card.intro, .glass-card.outro, .glass-card.quiz, .glass-card.rating { max-width: 95vw; max-height: 90vh; margin: clamp(4px, 1vw, 8px) auto; }
            .glass-card.game { max-height: 100vh; padding: clamp(4px, 0.8vw, 8px); }
            .game-content { flex-direction: column; max-width: 100vw; }
            .instructions-card { max-width: 100vw; min-width: 0; }
            .input-container { max-width: 80vw; }
            .neon-button { font-size: clamp(18px, 3vw, 20px); padding: clamp(6px, 1vw, 10px) clamp(10px, 1.5vw, 14px); max-width: 80vw; }
            .neon-input { font-size: clamp(18px, 3vw, 20px); max-width: 80vw; }
            .section-title { font-size: clamp(26px, 4vw, 32px); margin: clamp(1px, 0.3vw, 3px) 0; }
            .empty-state { font-size: clamp(18px, 3vw, 20px); }
            .ship-card { font-size: clamp(18px, 3vw, 20px); padding: clamp(4px, 0.6vw, 6px); }
            .score-breakdown { max-width: 90vw; font-size: clamp(18px, 3vw, 20px); }
            .score-breakdown p { font-size: clamp(18px, 3vw, 20px); }
            .pause-button { font-size: clamp(18px, 3vw, 20px); padding: clamp(4px, 0.6vw, 6px) clamp(6px, 1vw, 10px); }
            .pause-menu h2 { font-size: clamp(22px, 4vw, 26px); }
            .planet-1, .planet-3 { font-size: clamp(18px, 4vw, 22px); }
            .planet-2, .planet-4 { font-size: clamp(14px, 3.5vw, 18px); }
            .progress-bar-container {
              width: 100%;
              height: clamp(12px, 1.8vw, 16px);
              margin: clamp(1px, 0.3vw, 3px) auto;
            }
            .progress-bar::after { font-size: clamp(16px, 2.8vw, 18px); }
            .instructions-card { max-width: 100vw; }
            .instructions-card h3 { font-size: clamp(22px, 3.5vw, 26px); }
            .instructions-card ul { font-size: clamp(18px, 3vw, 20px); }
            .instructions-card li::before { font-size: clamp(18px, 3vw, 20px); }
            .story-card { max-width: 95vw; }
            .story-card p { font-size: clamp(20px, 3.2vw, 24px); }
            .queue-explanation { max-width: 95vw; }
            .queue-explanation h3 { font-size: clamp(20px, 3.2vw, 24px); }
            .queue-explanation p { font-size: clamp(18px, 3vw, 20px); }
            .queue-item { font-size: clamp(18px, 3vw, 20px); padding: clamp(4px, 0.6vw, 6px); }
            .queue-arrow { font-size: clamp(18px, 3vw, 20px); }
            .text-gray { font-size: clamp(18px, 3vw, 20px); }
          }

          @media (min-width: 769px) {
            .section-title { font-size: clamp(34px, 4.2vw, 42px); }
            .progress-bar-container { margin: clamp(1px, 0.3vw, 3px) auto; }
          }
        `}
      </style>

      <div className="nebula"></div>
      <div className="planet planet-1">🪐</div>
      <div className="planet planet-2">🌍</div>
      <div className="planet planet-3">🌑</div>
      <div className="planet planet-4">🪐</div>

      {step !== 'intro' && (
        <button onClick={handlePause} className="neon-button pause-button" disabled={isPaused}>
          Pause ⏸️
        </button>
      )}

      {isPaused && (
        <div className="pause-overlay">
          <div className="pause-menu">
            <h2 className="text-magenta">Game Paused</h2>
            <div className="button-group">
              <button onClick={handleResume} className="neon-button button-cyan">
                Resume ▶️
              </button>
              <button onClick={handleRestart} className="neon-button button-yellow">
                Restart 🔄
              </button>
              <button onClick={handleDashboard} className="neon-button button-red">
                Dashboard 🏠
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'intro' && (
        <div className="glass-card intro">
          <h1 className="section-title text-cyan">🌌 Galactic Dock: Level 14</h1>
          <div className="story-card">
            <p>
              In 3075, you command Nebula Station orbiting Zyrion. A fleet of starships approaches, but the docking bay processes one ship at a time. Use a FIFO queue to dock them in arrival order. Save the station! 🚀
            </p>
          </div>
          <button onClick={handleStartGame} className="neon-button button-cyan">
            Launch Mission ⭐
          </button>
        </div>
      )}

      {step === 'game' && (
        <div className="glass-card game">
          <h2 className="section-title text-magenta">🌠 Stellar Command</h2>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="game-content">
            <div className="instructions-card">
              <h3>How to Play:</h3>
              <ul>
                <li>Enter a Ship ID (e.g., A, B, C) and click "Queue Ship".</li>
                <li>Click "Dock Next" to move the first ship to the docking bay.</li>
                <li>Earn 10 points per queued ship, 20 per docked ship.</li>
                <li>Click "End Mission" to proceed to the quiz.</li>
                <li>Track progress with the bar above.</li>
              </ul>
            </div>
            <div className="input-container">
              <input
                type="text"
                value={inputShip}
                onChange={(e) => setInputShip(e.target.value)}
                placeholder="Enter Ship ID (e.g., A)"
                className="neon-input"
                disabled={isPaused}
              />
              <button onClick={addToQueue} className="neon-button button-magenta" disabled={isPaused}>
                Queue Ship 🚀
              </button>
              <button onClick={dockNextShip} className="neon-button button-cyan" disabled={isPaused}>
                Dock Next 🪐
              </button>
              <button onClick={finishGame} className="neon-button button-red" disabled={isPaused}>
                End Mission 🌌
              </button>
            </div>
          </div>
          <div style={{ margin: 'clamp(1px, 0.3vw, 3px) 0', flex: 1, overflow: 'auto' }}>
            <h3 className="section-title text-cyan">Starship Queue:</h3>
            <div className="flex-container">
              {queue.length === 0 ? (
                <p className="empty-state">No starships in queue 🌌</p>
              ) : (
                queue.map((ship, idx) => (
                  <div key={idx} className="ship-card">
                    🚀 {ship}
                  </div>
                ))
              )}
            </div>
          </div>
          <div style={{ margin: 'clamp(1px, 0.3vw, 3px) 0', flex: 1, overflow: 'auto' }}>
            <h3 className="section-title text-cyan">Docked Starships:</h3>
            <div className="flex-container">
              {dockedShips.length === 0 ? (
                <p className="empty-state">No starships docked ⭐</p>
              ) : (
                dockedShips.map((ship, idx) => (
                  <div key={idx} className="ship-card docked docking">
                    🪐 {ship}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {step === 'outro' && (
        <div className="glass-card outro">
          <h2 className="section-title text-green">Mission Complete! 🌟</h2>
          <p className="text-gray">
            You've managed the galactic queue, ensuring cosmic order! 🚀
          </p>
          <div className="queue-explanation">
            <h3>FIFO Queues</h3>
            <p>
              A FIFO (First-In-First-Out) queue processes ships in arrival order. Add to the end, dock from the front.
            </p>
            <p>Example queue: A, B, C</p>
            <div className="queue-diagram">
              <div className="queue-item">A</div>
              <span className="queue-arrow">➡️</span>
              <div className="queue-item">B</div>
              <span className="queue-arrow">➡️</span>
              <div className="queue-item">C</div>
            </div>
            <p>Dock order: A, B, C. Used in task scheduling and data processing.</p>
          </div>
          <button onClick={handleQuizNavigation} className="neon-button button-yellow" disabled={isPaused}>
            Cosmic Quiz ⭐
          </button>
        </div>
      )}

      {step === 'quiz' && (
        <div className="glass-card quiz">
          <h2 className="section-title text-magenta">Cosmic Quiz 🌌</h2>
          <p className="text-gray">If the queue is [A, B, C], which starship docks next? 🚀</p>
          <input
            type="text"
            value={quizAnswer}
            onChange={(e) => setQuizAnswer(e.target.value)}
            placeholder="Your Answer"
            className="neon-input"
            style={{ maxWidth: '25vw', margin: '0 auto clamp(4px, 0.6vw, 6px)' }}
            disabled={isPaused}
          />
          <button onClick={handleQuizSubmit} className="neon-button button-magenta" disabled={isPaused}>
            Submit Answer 🌠
          </button>
        </div>
      )}

      {step === 'rating' && (
        <div className="glass-card rating">
          <h2 className="section-title text-yellow">Galactic Rating ⭐</h2>
          <p className="text-gray">Your cosmic score:</p>
          <div className="text-4vw text-yellow" style={{ fontSize: 'clamp(48px, 6vw, 72px)' }}>
            {'★'.repeat(score)}
            {'☆'.repeat(3 - score)}
          </div>
          <div className="score-breakdown">
            <p>Game Points: {gamePoints} ⭐</p>
            <p>Quiz Points: {quizPoints} 🌌</p>
            <p><strong>Total: {totalPoints} 🚀</strong></p>
          </div>
          <div className="button-group">
            <button onClick={() => setStep('intro')} className="neon-button button-cyan" disabled={isPaused}>
              Replay Mission 🌌
            </button>
            <button onClick={handleNextLevel} className="neon-button button-yellow" disabled={isPaused}>
              Next Level 🌟
            </button>
          </div>
          {nextLevel && (
            <p className="text-gray">
              Proceeding to Level 15... (Placeholder)
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default FifoGame;