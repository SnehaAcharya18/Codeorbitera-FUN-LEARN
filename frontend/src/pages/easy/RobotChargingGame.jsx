import React, { useState, useEffect, useRef } from 'react';
import sadRobot from '../../assets/images/level1/sadRobot.png';
import happyRobot from '../../assets/images/level1/happyRobot.png';
import battery30 from '../../assets/images/level1/30p.png';
import battery60 from '../../assets/images/level1/60p.png';
import battery90 from '../../assets/images/level1/90.png';
import bgMusicFile from '../../assets/sounds/level1/bg.mp3';
import clickSoundFile from '../../assets/sounds/level1/click.wav';
import wrongSoundFile from '../../assets/sounds/level1/wrong.wav';
import axios from "axios";

export default function App() {
  const [stage, setStage] = useState('intro');
  const [battery, setBattery] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [paused, setPaused] = useState(false);
  const [pauseStartTime, setPauseStartTime] = useState(null);

  // Audio refs
  const bgMusic = useRef(null);
  const clickSound = useRef(null);
  const wrongSound = useRef(null);

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
    if (
      stage === "result" &&
      startTime !== null &&
      endTime !== null &&
      battery !== null &&
      selectedAnswer !== null
    ) {
      const timeSec = Math.round((endTime - startTime) / 1000);
      const stars = timeSec <= 10 ? 3 : timeSec <= 20 ? 2 : 1;
      const finalScore = Math.max(0, 100 - Math.max(0, timeSec - 10) - (3 - stars) * 10);
      postScore("Level 1", finalScore);
    }
  }, [stage]);

  // Initialize audio
  useEffect(() => {
    bgMusic.current = new Audio(bgMusicFile);
    clickSound.current = new Audio(clickSoundFile);
    wrongSound.current = new Audio(wrongSoundFile);
    
    bgMusic.current.loop = true;
    bgMusic.current.volume = 0.3;

    return () => {
      bgMusic.current.pause();
    };
  }, []);

  // Handle music play/pause based on stage and pause state
  useEffect(() => {
    try {
      if (stage !== 'result' && !paused) {
        bgMusic.current.play().catch(error => {
          console.log("Audio play failed:", error);
        });
      } else {
        bgMusic.current.pause();
      }
    } catch (error) {
      console.log("Audio error:", error);
    }
  }, [stage, paused]);

  // Load Orbitron font dynamically
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  // Handle pause timer
  useEffect(() => {
    let pauseInterval;
    if (paused && stage === 'game') {
      setPauseStartTime(Date.now());
      pauseInterval = setInterval(() => {
        setEndTime(prev => prev ? prev : Date.now());
      }, 1000);
    } else if (!paused && pauseStartTime) {
      const pauseDuration = Date.now() - pauseStartTime;
      setStartTime(prev => prev ? prev + pauseDuration : null);
      setEndTime(prev => prev ? prev + pauseDuration : null);
      setPauseStartTime(null);
      clearInterval(pauseInterval);
    }
    return () => clearInterval(pauseInterval);
  }, [paused, stage]);

  const styles = {
    wrapper: {
      fontFamily: "'Orbitron', sans-serif",
      background: 'linear-gradient(to bottom right, #0d0d0d, #1a1a1a)',
      color: '#39ff14',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      margin: 0,
      padding: 0,
      position: 'relative',
      top: 0,
      left: 0,
    },
    intro: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100%',
      background: 'radial-gradient(circle at center, #111 0%, #000 100%)',
      color: '#fff',
      margin: 0,
      padding: '2rem',
      boxSizing: 'border-box',
    },
    introTitle: {
      fontSize: 'clamp(2rem, 5vw, 3rem)',
      fontWeight: 'bold',
      color: '#39ff14',
      marginBottom: '1rem',
      textShadow: '0 0 5px #39ff14, 0 0 15px #39ff14',
      animation: 'float 3s ease-in-out infinite',
    },
    introSubtitle: {
      fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
      marginBottom: '0.5rem',
      textShadow: '0 0 5px #39ff14',
      animation: 'float 4s ease-in-out infinite',
    },
    introButton: {
      marginTop: '2rem',
      padding: '1.2rem 2.4rem',
      fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
      background: 'linear-gradient(to right, #00ff99, #00ccff)',
      border: 'none',
      borderRadius: '10px',
      color: '#000',
      fontWeight: 'bold',
      cursor: 'pointer',
      animation: 'rotateBtn 2s linear infinite',
      transition: 'transform 0.3s, box-shadow 0.3s',
      boxShadow: '0 0 15px #00ff99, 0 0 30px #00ccff',
    },
    gameContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '80vh',
      width: '100%',
      padding: 'clamp(20px, 5vw, 100px)',
      gap: 'clamp(20px, 5vw, 50px)',
      boxSizing: 'border-box',
      flexWrap: 'wrap',
    },
    robotSection: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      gap: 'clamp(20px, 5vw, 60px)',
      maxWidth: '50%',
      flex: '1 1 400px',
    },
    robotImg: {
      width: 'clamp(200px, 40vw, 400px)',
      maxWidth: '400px',
      height: 'auto',
      transition: 'transform 0.3s ease-in-out',
      filter: 'drop-shadow(0 0 10px #39ff14)',
    },
    statusText: {
      fontSize: 'clamp(1rem, 3vw, 1.5rem)',
      textShadow: '0 0 5px #39ff14, 0 0 15px #39ff14',
      animation: 'pulse 2s infinite alternate',
    },
    batterySection: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'clamp(10px, 2.5vw, 20px)',
      maxWidth: '50%',
      flex: '1 1 400px',
    },
    pickText: {
      fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
      textShadow: '0 0 5px #39ff14',
      animation: 'pulse 2.5s infinite alternate',
    },
    batteryList: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'clamp(10px, 2.5vw, 15px)',
      alignItems: 'center',
    },
    batteryImg: {
      width: 'clamp(100px, 20vw, 150px)',
      maxWidth: '150px',
      height: 'auto',
      cursor: 'pointer',
      padding: '5px',
      border: '2px solid #39ff14',
      borderRadius: '10px',
      backgroundColor: '#1a1a1a',
      boxShadow: '0 0 10px #39ff14',
      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
      filter: 'drop-shadow(0 0 5px #39ff14)',
    },
    quizWrapper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100%',
      background: 'radial-gradient(circle at center, #111 0%, #000 100%)',
      padding: 'clamp(10px, 2.5vw, 2rem)',
      color: '#fff',
      textAlign: 'center',
      border: '2px solid #39ff14',
      boxShadow: '0 0 20px #39ff14, inset 0 0 20px #39ff14',
      boxSizing: 'border-box',
    },
    quizTitle: {
      fontSize: 'clamp(1.5rem, 4vw, 2rem)',
      marginBottom: '1.5rem',
      textShadow: '0 0 10px #39ff14, 0 0 20px #39ff14',
      animation: 'pulse 1.5s infinite alternate',
    },
    quizOption: {
      width: '100%',
      maxWidth: 'clamp(300px, 40vw, 400px)',
      padding: '0.8rem 1.2rem',
      marginBottom: '1rem',
      fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
      backgroundColor: '#1a1a1a',
      color: '#39ff14',
      border: '2px solid #39ff14',
      borderRadius: '10px',
      cursor: 'pointer',
      boxShadow: '0 0 10px #39ff14',
      transition: 'all 0.3s ease-in-out',
      textAlign: 'left',
    },
    quizSubmit: {
      marginTop: '2rem',
      padding: '1rem 2.5rem',
      fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
      background: 'linear-gradient(to right, #9b5de5, #00f5d4)',
      border: 'none',
      borderRadius: '10px',
      color: '#000',
      fontWeight: 'bold',
      cursor: 'pointer',
      boxShadow: '0 0 15px #9b5de5, 0 0 30px #00f5d4',
      transition: 'transform 0.3s, box-shadow 0.3s',
    },
    resultWrapper: {
      background: 'radial-gradient(circle at center, #111 0%, #000 100%)',
      color: '#fff',
      height: '100vh',
      width: '100%',
      padding: 'clamp(10px, 2.5vw, 2rem)',
      border: '2px solid #39ff14',
      boxShadow: '0 0 30px #39ff14, inset 0 0 20px #39ff14',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
    },
    resultTitle: {
      fontSize: 'clamp(2rem, 5vw, 2.5rem)',
      marginBottom: '1.5rem',
      textShadow: '0 0 10px #39ff14, 0 0 20px #39ff14',
      animation: 'pulse 1.5s infinite alternate',
    },
    resultText: {
      fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
      marginBottom: '1rem',
      textShadow: '0 0 5px #39ff14',
    },
    starContainer: {
      margin: '1.5rem 0',
      animation: 'pulse 2s infinite alternate',
    },
    star: {
      fontSize: 'clamp(2rem, 5vw, 3rem)',
      margin: '0 0.5rem',
      color: '#ffd700',
      filter: 'drop-shadow(0 0 5px #ffd700)',
      animation: 'glow 1.5s infinite alternate',
    },
    resultButton: {
      marginTop: '2rem',
      padding: '1rem 2.5rem',
      fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
      background: 'linear-gradient(to right, #00f5d4, #ff6ec7)',
      border: 'none',
      borderRadius: '10px',
      color: '#000',
      fontWeight: 'bold',
      cursor: 'pointer',
      boxShadow: '0 0 15px #00f5d4, 0 0 30px #ff6ec7',
      transition: 'transform 0.3s, box-shadow 0.3s',
    },
    backButton: {
      marginTop: '2rem',
      marginLeft: '1rem',
      padding: '1rem 2.5rem',
      fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
      background: 'linear-gradient(to right, #ff4444, #ff6ec7)',
      border: 'none',
      borderRadius: '10px',
      color: '#000',
      fontWeight: 'bold',
      cursor: 'pointer',
      boxShadow: '0 0 15px #ff4444, 0 0 30px #ff6ec7',
      transition: 'transform 0.3s, box-shadow 0.3s',
    },
    nextLevelButton: {
      marginTop: '2rem',
      marginLeft: '1rem',
      padding: '1rem 2.5rem',
      fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
      background: 'linear-gradient(to right, #00ccff, #39ff14)',
      border: 'none',
      borderRadius: '10px',
      color: '#000',
      fontWeight: 'bold',
      cursor: 'pointer',
      boxShadow: '0 0 15px #00ccff, 0 0 30px #39ff14',
      transition: 'transform 0.3s, box-shadow 0.3s',
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '1rem',
      flexWrap: 'wrap',
    },
    correctAnswer: {
      color: '#39ff14',
      textShadow: '0 0 10px #39ff14',
      fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
      fontWeight: 'bold',
    },
    wrongAnswer: {
      color: '#ff4444',
      textShadow: '0 0 10px #ff4444',
      fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
      fontWeight: 'bold',
    },
    pauseButton: {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '1rem 2rem',
      fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
      background: 'linear-gradient(to right, #ffcc00, #ff6600)',
      border: 'none',
      borderRadius: '10px',
      color: '#000',
      fontWeight: 'bold',
      cursor: 'pointer',
      boxShadow: '0 0 15px #ffcc00, 0 0 30px #ff6600',
      zIndex: 1000,
    },
    popup: {
      display: paused ? 'flex' : 'none',
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(0, 0, 0, 0.9)',
      padding: '2rem',
      borderRadius: '10px',
      border: '2px solid #39ff14',
      boxShadow: '0 0 20px #39ff14',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem',
      maxWidth: '90%',
      width: 'clamp(300px, 40vw, 500px)',
      zIndex: 2000,
    },
    popupButton: {
      padding: '1rem 2rem',
      fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
      background: 'linear-gradient(to right, #00ff99, #00ccff)',
      border: 'none',
      borderRadius: '10px',
      color: '#000',
      fontWeight: 'bold',
      cursor: 'pointer',
      boxShadow: '0 0 15px #00ff99, 0 0 30px #00ccff',
      transition: 'transform 0.3s, box-shadow 0.3s',
    },
    backdrop: {
      display: paused ? 'block' : 'none',
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
    },
  };

  // Animations via CSS injection
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      @keyframes rotateBtn {
        0% { transform: rotate(-2deg); }
        50% { transform: rotate(2deg); }
        100% { transform: rotate(-2deg); }
      }
      @keyframes pulse {
        0% { opacity: 0.8; }
        100% { opacity: 1; }
      }
      @keyframes glow {
        0% { text-shadow: 0 0 5px #ffd700, 0 0 10px #ffd700; }
        100% { text-shadow: 0 0 10px #ffd700, 0 0 20px #ffd700; }
      }
      @keyframes neon-border {
        0% { box-shadow: 0 0 10px #39ff14, inset 0 0 10px #39ff14; }
        50% { box-shadow: 0 0 20px #39ff14, inset 0 0 20px #39ff14; }
        100% { box-shadow: 0 0 10px #39ff14, inset 0 0 10px #39ff14; }
      }
      @media (max-width: 768px) {
        .gameContainer { padding: clamp(20px, 5vw, 50px); gap: clamp(5px, 2.5vw, 10px); flex-direction: column; }
        .robotSection, .batterySection { max-width: 100%; }
        .robotImg { width: clamp(150px, 40vw, 300px); }
        .batteryImg { width: clamp(80px, 20vw, 120px); }
        .quizOption { max-width: clamp(250px, 70vw, 350px); }
        .buttonContainer { flex-direction: column; gap: clamp(10px, 2.5vw, 1rem); }
        .pauseButton { top: 10px; right: 10px; padding: 0.8rem 1.5rem; }
      }
      @media (max-width: 480px) {
        .introTitle { font-size: clamp(1.5rem, 4vw, 2rem); }
        .introSubtitle { font-size: clamp(0.9rem, 2vw, 1rem); }
        .introButton { padding: 1rem 2rem; font-size: clamp(0.9rem, 2vw, 1.1rem); }
        .robotSection { gap: clamp(10px, 2.5vw, 20px); }
        .statusText { font-size: clamp(0.9rem, 2vw, 1.2rem); }
        .pickText { font-size: clamp(0.9rem, 2vw, 1rem); }
        .quizTitle { font-size: clamp(1.2rem, 3vw, 1.5rem); }
        .quizOption { font-size: clamp(0.9rem, 2vw, 1rem); max-width: clamp(200px, 60vw, 300px); }
        .resultTitle { font-size: clamp(1.5rem, 4vw, 2rem); }
        .resultText { font-size: clamp(0.9rem, 2vw, 1rem); }
        .star { font-size: clamp(1.5rem, 4vw, 2rem); }
        .pauseButton { top: 5px; right: 5px; padding: 0.6rem 1rem; }
      }
    `;
    document.head.appendChild(style);
  }, []);

  const Intro = ({ onStart }) => {
    return (
      <div style={styles.intro}>
        <h1 style={styles.introTitle}>🔋 Robot Charging Station</h1>
        <p style={styles.introSubtitle}>Learn how to use <strong>variables</strong> to store values!</p>
        <p style={styles.introSubtitle}>A robot is waiting to be charged. Choose the right battery!</p>
        <button style={styles.introButton} onClick={() => {
          clickSound.current.play();
          onStart();
        }}>
          Start Game
        </button>
      </div>
    );
  };

  const Game = ({ onCharge, onRestart }) => {
    const [charged, setCharged] = useState(false);

    const handleCharge = (value) => {
      if (!paused) {
        clickSound.current.play();
        setCharged(true);
        setTimeout(() => onCharge(value), 1500);
      }
    };

    return (
      <div style={styles.gameContainer}>
        <div style={styles.backdrop}></div>
        <div style={styles.robotSection}>
          <img 
            src={charged ? happyRobot : sadRobot} 
            alt="Robot" 
            style={{
              ...styles.robotImg,
              animation: charged ? 'pulse 1s infinite alternate' : 'none'
            }} 
          />
          <h2 style={styles.statusText}>
            {charged ? "Yay! I'm charged up!" : "I'm sad... please charge me!"}
          </h2>
        </div>
        <div style={styles.batterySection}>
          <h3 style={styles.pickText}>Pick a battery</h3>
          <div style={styles.batteryList}>
            {[battery30, battery60, battery90].map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`${[30, 60, 90][i]}%`}
                style={styles.batteryImg}
                onClick={() => handleCharge([30, 60, 90][i])}
                onMouseEnter={() => {
                  const batteries = document.querySelectorAll('[alt^="30"], [alt^="60"], [alt^="90"]');
                  batteries.forEach(b => b.style.transform = 'scale(1)');
                  const current = document.querySelector(`[alt="${[30, 60, 90][i]}%"]`);
                  current.style.transform = 'scale(1.1)';
                  current.style.boxShadow = '0 0 15px #39ff14';
                }}
                onMouseLeave={() => {
                  const current = document.querySelector(`[alt="${[30, 60, 90][i]}%"]`);
                  current.style.transform = 'scale(1)';
                  current.style.boxShadow = '0 0 10px #39ff14';
                }}
              />
            ))}
          </div>
        </div>
        <button style={styles.pauseButton} onClick={() => setPaused(true)}>
          Pause
        </button>
        <div style={styles.popup}>
          <button style={styles.popupButton} onClick={() => setPaused(false)}>Resume</button>
          <button style={styles.popupButton} onClick={() => window.location.href = '/dashboard'}>Dashboard</button>
          <button style={styles.popupButton} onClick={() => {
            clickSound.current.play();
            onRestart();
          }}>Restart</button>
        </div>
      </div>
    );
  };

  const Outro = ({ onNext }) => (
    <div style={{
      ...styles.quizWrapper,
      animation: 'neon-border 3s infinite'
    }}>
      <h2 style={styles.quizTitle}>🎮✨ Level Complete!</h2>
      <p style={styles.resultText}>⚡ You used the variable <strong style={{ color: '#39ff14', textShadow: '0 0 5px #39ff14' }}>battery</strong> to store a number value.</p>
      <p style={styles.resultText}>📦 Variables are magical containers that hold your data during gameplay!</p>
      <button style={styles.quizSubmit} onClick={() => {
        clickSound.current.play();
        onNext();
      }}>🚀 Continue</button>
    </div>
  );

  const Quiz = ({ onSubmit }) => {
    const [selected, setSelected] = useState(null);

    const options = [
      "charge, String",
      "battery, Number",
      "energy, Boolean",
      "fuel, String",
    ];

    const handleSubmit = () => {
      if (selected === 1) {
        clickSound.current.play();
      } else {
        wrongSound.current.play();
      }
      onSubmit(selected);
    };

    return (
      <div style={{
        ...styles.quizWrapper,
        animation: 'neon-border 3s infinite'
      }}>
        <h2 style={styles.quizTitle}>🧠 Robot Recharge Quiz</h2>
        <p style={styles.resultText}>Which variable was used to store the robot's battery level, and what is its data type?</p>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          {options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => {
                clickSound.current.play();
                setSelected(idx);
              }}
              style={{
                ...styles.quizOption,
                backgroundColor: selected === idx ? '#39ff14' : '#1a1a1a',
                color: selected === idx ? '#000' : '#39ff14',
                boxShadow: selected === idx ? '0 0 15px #39ff14' : '0 0 10px #39ff14',
                transform: selected === idx ? 'scale(1.02)' : 'scale(1)'
              }}
            >
              {opt}
            </button>
          ))}
        </div>
        <button
          style={{
            ...styles.quizSubmit,
            transform: selected === null ? 'scale(1)' : 'scale(1.05)'
          }}
          disabled={selected === null}
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    );
  };

  const Result = ({ selected, battery, time, onRestart }) => {
    const correctAnswer = 1;
    const timeSec = Math.round(time / 1000);
    const stars = timeSec <= 10 ? 3 : timeSec <= 20 ? 2 : 1;
    const finalScore = Math.max(0, 100 - Math.max(0, timeSec - 10) - (3 - stars) * 10);

    return (
      <div style={{
        ...styles.resultWrapper,
        animation: 'neon-border 3s infinite'
      }}>
        <h2 style={styles.resultTitle}>📊 Results</h2>
        <p style={selected === correctAnswer ? styles.correctAnswer : styles.wrongAnswer}>
          {selected === correctAnswer
            ? '✅ Correct! 🎉'
            : '❌ The correct answer is "battery, Number".'}
        </p>
        <p style={styles.resultText}>🔋 Battery charged to: <span style={{ color: '#39ff14' }}>{battery}%</span></p>
        <p style={styles.resultText}>⏱ Time taken: <span style={{ color: '#39ff14' }}>{timeSec} seconds</span></p>
        <div style={styles.starContainer}>
          {Array(stars).fill('⭐').map((s, i) => (
            <span key={i} style={styles.star}>{s}</span>
          ))}
        </div>
        <p style={styles.resultText}>🏆 Final Score: <span style={{ color: '#39ff14', fontSize: '1.5rem' }}>{finalScore}</span></p>
        <div style={styles.buttonContainer}>
          <button style={styles.resultButton} onClick={() => {
            clickSound.current.play();
            onRestart();
          }}>
            Restart Game
          </button>
          <button style={styles.backButton} onClick={() => {
            clickSound.current.play();
            window.location.href = '/dashboard';
          }}>
            Back to Dashboard
          </button>
          <button style={styles.nextLevelButton} onClick={() => {
            clickSound.current.play();
            window.location.href = '/LearningGame';
            console.log('Navigate to next level');
          }}>
            Next Level
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.wrapper}>
      {stage === 'intro' && (
        <Intro onStart={() => {
          setStartTime(Date.now());
          setStage('game');
        }} />
      )}
      {stage === 'game' && (
        <Game 
          onCharge={(val) => {
            setBattery(val);
            setEndTime(Date.now());
            setStage('outro');
          }} 
          onRestart={() => {
            setBattery(null);
            setStartTime(null);
            setEndTime(null);
            setSelectedAnswer(null);
            setPaused(false);
            setStage('intro');
          }}
        />
      )}
      {stage === 'outro' && <Outro onNext={() => setStage('quiz')} />}
      {stage === 'quiz' && <Quiz onSubmit={(ans) => {
        setSelectedAnswer(ans);
        setStage('result');
      }} />}
      {stage === 'result' && (
        <Result
          selected={selectedAnswer}
          battery={battery}
          time={endTime - startTime}
          onRestart={() => {
            setBattery(null);
            setStartTime(null);
            setEndTime(null);
            setSelectedAnswer(null);
            setPaused(false);
            setStage('intro');
          }}
        />
      )}
    </div>
  );
}