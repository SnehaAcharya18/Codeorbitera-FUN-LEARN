import React, { useEffect, useRef, useState, useCallback } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/theme-monokai';
import axios from 'axios';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { oneDark } from '@codemirror/theme-one-dark';
import { motion } from 'framer-motion';

// Import assets from src folder
import bgImage from '../../assets/images/hardleveldebug2/bg13.jpg';
import backgroundMusic from '../../assets/sounds/hardleveldebug2/background.mp3';
import clickSound from '../../assets/sounds/hardleveldebug2/click.wav';

const orbitronStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    overflow-x: hidden;
  }
  @media (max-width: 768px) {
    button:hover {
      transform: none !important;
    }
  }
`;

const DebuggerGame = () => {
  const [showOverlay, setShowOverlay] = useState('intro');
  const [score, setScore] = useState(1000);
  const [time, setTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [level, setLevel] = useState(1);
  const [editorValue, setEditorValue] = useState(
    `#include <iostream>\nusing namespace std;\n\nint main() {\n    for (int i = 0; i <= 5; i--) {\n        cout << "Number: " << i << endl;\n    }\n    return 0;\n}`
  );
  const [codeEditorCode, setCodeEditorCode] = useState(
    `#include <iostream>\nusing namespace std;\n\nint main() {\n    for (int i = 0; i <= 5; i--) {\n        cout << "Number: " << i << endl;\n    }\n    return 0;\n}`
  );
  const [codeEditorInput, setCodeEditorInput] = useState('');
  const [codeEditorOutput, setCodeEditorOutput] = useState('');
  const [codeEditorLoading, setCodeEditorLoading] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [stars, setStars] = useState(3);
  const [codeSubmitted, setCodeSubmitted] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const timerRef = useRef(null);
  const scoreRef = useRef(1000);
  const timeRef = useRef(0);
  const backgroundMusicRef = useRef(null);
  const clickSoundRef = useRef(null);

  const postScore = async (levelName, score) => {
    try {
      await axios.post('http://localhost:5000/api/auth/score', {
        level: levelName,
        score,
      }, { withCredentials: true });
    } catch (err) {
      console.error('Failed to post score:', err);
    }
  };

  useEffect(() => {
    if (showOverlay === 'stars') {
      postScore('Level 13', score);
    }
  }, [showOverlay]);

  useEffect(() => {
    backgroundMusicRef.current = new Audio(backgroundMusic);
    backgroundMusicRef.current.loop = true;
    backgroundMusicRef.current.volume = 0.3;

    clickSoundRef.current = new Audio(clickSound);
    clickSoundRef.current.volume = 0.5;

    return () => {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
      }
    };
  }, []);

  const playBackgroundMusic = () => {
    const shouldPlayMusic = localStorage.getItem('playBackgroundMusic') !== 'false';
    if (shouldPlayMusic && backgroundMusicRef.current) {
      backgroundMusicRef.current
        .play()
        .then(() => {
          console.log('Background music playing');
          localStorage.setItem('playBackgroundMusic', 'true');
          setAudioError(null);
        })
        .catch((error) => {
          console.log('Error playing background music:', error.message);
          setAudioError('Failed to play background music');
        });
    }
  };

  useEffect(() => {
    if (gameStarted && !isPaused) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime + 1;
          timeRef.current = newTime;
          setScore((prevScore) => {
            const newScore = Math.max(prevScore - 5, 0);
            scoreRef.current = newScore;
            return newScore;
          });
          return newTime;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [gameStarted, isPaused]);

  const startGame = () => {
    clearInterval(timerRef.current);
    setGameStarted(true);
    setShowOverlay('');
    setTime(0);
    setScore(1000);
    scoreRef.current = 1000;
    timeRef.current = 0;
    setQuizPassed(false);
    setStars(3);
    setCodeSubmitted(false);
    setEditorValue(
      `#include <iostream>\nusing namespace std;\n\nint main() {\n    for (int i = 0; i <= 5; i--) {\n        cout << "Number: " << i << endl;\n    }\n    return 0;\n}`
    );
    setIsPaused(false);
    playBackgroundMusic();

    timerRef.current = setInterval(() => {
      setTime((prevTime) => {
        const newTime = prevTime + 1;
        timeRef.current = newTime;
        setScore((prevScore) => {
          const newScore = Math.max(prevScore - 5, 0);
          scoreRef.current = newScore;
          return newScore;
        });
        return newTime;
      });
    }, 1000);
  };

  const pauseGame = () => {
    setIsPaused(true);
    setShowOverlay('pause');
    clearInterval(timerRef.current);
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
      console.log('Background music paused');
    }
  };

  const resumeGame = () => {
    setIsPaused(false);
    setShowOverlay('');
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current
        .play()
        .then(() => console.log('Background music resumed'))
        .catch((error) => {
          console.log('Error resuming background music:', error.message);
          setAudioError('Failed to resume background music');
        });
    }
    timerRef.current = setInterval(() => {
      setTime((prevTime) => {
        const newTime = prevTime + 1;
        timeRef.current = newTime;
        setScore((prevScore) => {
          const newScore = Math.max(prevScore - 5, 0);
          scoreRef.current = newScore;
          return newScore;
        });
        return newTime;
      });
    }, 1000);
  };

  const restartGame = () => {
    clearInterval(timerRef.current);
    setShowOverlay('intro');
    setGameStarted(false);
    setQuizPassed(false);
    setStars(3);
    setCodeSubmitted(false);
    setEditorValue(
      `#include <iostream>\nusing namespace std;\n\nint main() {\n    for (int i = 0; i <= 5; i--) {\n        cout << "Number: " << i << endl;\n    }\n    return 0;\n}`
    );
    setIsPaused(false);
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
    }
  };

  const goToNextLevel = () => {
    window.location.href = '/elevater';
  };

  const goBack = () => {
    window.location.href = '/dashboard';
  };

  const submitCode = () => {
    const correctCode =
      editorValue.includes('for (int i = 1') &&
      editorValue.includes('i < 5') &&
      editorValue.includes('i++');
    if (correctCode) {
      clearInterval(timerRef.current);
      setGameStarted(false);
      setCodeSubmitted(true);
      setShowOverlay('outro');
    } else {
      alert('Your code still has errors! Fix the loop initialization, condition, and increment.');
      setScore((prevScore) => {
        const newScore = Math.max(prevScore - 50, 0);
        scoreRef.current = newScore;
        return newScore;
      });
    }
  };

  const calculateStars = () => {
    if (score >= 800) return 3;
    if (score >= 400) return 2;
    return 1;
  };

  const handleQuizAnswer = (correct) => {
    if (correct) {
      setQuizPassed(true);
      setStars(calculateStars());
      setShowOverlay('stars');
    } else {
      alert('Incorrect, try again!');
      setScore((prevScore) => {
        const newScore = Math.max(prevScore - 50, 0);
        scoreRef.current = newScore;
        return newScore;
      });
    }
  };

  const playClickSound = () => {
    if (clickSoundRef.current) {
      clickSoundRef.current.currentTime = 0;
      clickSoundRef.current
        .play()
        .catch((error) => {
          console.log('Error playing click sound:', error.message);
          setAudioError('Failed to play click sound');
        });
    }
  };

  const runCode = useCallback(async () => {
    setCodeEditorLoading(true);
    try {
      const res = await axios.post(
        'http://localhost:5000/api/auth/Codeanalyser',
        {
          script: codeEditorCode,
          language: 'cpp',
          versionIndex: '5',
          stdin: codeEditorInput,
        }
      );
      setCodeEditorOutput(res.data.output);
    } catch (err) {
      setCodeEditorOutput('❌ Error: ' + err.message);
    }
    setCodeEditorLoading(false);
  }, [codeEditorCode, codeEditorInput]);

  const buttonStyle = (color, isDarkText = false) => ({
    background: `linear-gradient(45deg, ${color}CC, ${color}FF)`,
    border: `2px solid ${color}`,
    color: isDarkText ? '#000' : '#fff',
    padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)',
    margin: '0.5rem',
    borderRadius: '0.5rem',
    fontSize: 'clamp(18px, 4.5vw, 25px)',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: "'Orbitron', sans-serif",
    textShadow: `0 0 8px ${color}, 0 0 12px ${color}`,
    boxShadow: `0 0 10px ${color}, 0 0 15px ${color}`,
    transition: 'all 0.3s ease',
    touchAction: 'manipulation',
  });

  return (
    <>
      <style>{orbitronStyle}</style>
      <div
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          width: '100vw',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          fontSize: 'clamp(12px, 3vw, 14px)',
          padding: '1rem',
        }}
      >
        {gameStarted && (
          <>
            <div
              style={{
                position: 'absolute',
                top: '0.5rem',
                left: '0.5rem',
                color: '#00FFFF',
                fontFamily: "'Orbitron', sans-serif",
                fontSize: 'clamp(12px, 3.5vw, 14px)',
                fontWeight: '700',
                textShadow: '0 0 8px #00FFFF, 0 0 12px #00FFFF',
                background: 'rgba(0, 0, 0, 0.7)',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid #00FFFF',
                boxShadow: '0 0 10px #00FFFF',
                zIndex: 3,
              }}
            >
              🖥️ Score: {score}
            </div>
            <div
              style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                color: '#00FFFF',
                fontFamily: "'Orbitron', sans-serif",
                fontSize: 'clamp(12px, 3.5vw, 14px)',
                fontWeight: '700',
                textShadow: '0 0 8px #00FFFF, 0 0 12px #00FFFF',
                background: 'rgba(0, 0, 0, 0.7)',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid #00FFFF',
                boxShadow: '0 0 10px #00FFFF',
                zIndex: 3,
              }}
            >
              ⏱️ Time: {time}s
            </div>
            {!isPaused && !showOverlay && !codeSubmitted && (
              <button
                onClick={() => {
                  playClickSound();
                  pauseGame();
                }}
                style={{
                  ...buttonStyle('#FFA500'),
                  position: 'absolute',
                  top: '0.3rem',
                  right: '9rem',
                  padding: '0.5rem 0.75rem',
                  fontSize: 'clamp(15px, 4vw, 20px)',
                }}
              >
                ⏸️Pause
              </button>
            )}
          </>
        )}

        {audioError && showOverlay && (
          <div
            style={{
              position: 'absolute',
              top: '2.5rem',
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#FF0044',
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 'clamp(12px, 3vw, 13px)',
              textShadow: '0 0 8px #FF0044',
              background: 'rgba(0, 0, 0, 0.7)',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.5rem',
              zIndex: 3,
              maxWidth: '90%',
              textAlign: 'center',
            }}
          >
            ⚠️ {audioError}
          </div>
        )}

        {showOverlay && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(50, 0, 100, 0.95))',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              fontFamily: "'Orbitron', sans-serif",
              textAlign: 'center',
              padding: '1rem',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.7)',
                border: '2px solid #00FFFF',
                borderRadius: '0.75rem',
                padding: 'clamp(1rem, 4vw, 1.5rem)',
                boxShadow: '0 0 10px #00FFFF, 0 0 20px #00FFFF',
                maxWidth: '95%',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              {showOverlay === 'intro' && (
                <>
                  <h2
                    style={{
                      color: '#00FFFF',
                      fontSize: 'clamp(25px, 8vw, 35px)',
                      textShadow: '0 0 8px #00FFFF, 0 0 12px #00FFFF',
                      fontWeight: '700',
                      marginBottom: '1rem',
                    }}
                  >
                    🐞 Debug the Loop! 💻
                  </h2>
                  <p
                    style={{
                      color: '#E0FF00',
                      fontSize: 'clamp(15px, 5vw, 30px)',
                      margin: '0.5rem 0 1rem',
                      textShadow: '0 0 8px #E0FF00',
                    }}
                  >
                    Fix the loop to print numbers 1 to 4. Watch out for initialization, condition, and increment bugs! ⏰
                  </p>
                  <button
                    onClick={() => {
                      playClickSound();
                      startGame();
                    }}
                    style={buttonStyle('#00FFFF')}
                  >
                    🚀 Start Game
                  </button>
                </>
              )}

              {showOverlay === 'pause' && (
                <>
                  <h2
                    style={{
                      color: '#FFA500',
                      fontSize: 'clamp(20px, 6vw, 24px)',
                      textShadow: '0 0 8px #FFA500, 0 0 12px #FFA500',
                      fontWeight: '700',
                      marginBottom: '1rem',
                    }}
                  >
                    ⏸️ Game Paused
                  </h2>
                  <p
                    style={{
                      color: '#E0FF00',
                      fontSize: 'clamp(13px, 3.5vw, 14px)',
                      margin: '0.5rem 0 1rem',
                      textShadow: '0 0 8px #E0FF00',
                    }}
                  >
                    Choose an option:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => {
                        playClickSound();
                        resumeGame();
                      }}
                      style={buttonStyle('#00FF00')}
                    >
                      ▶️ Resume
                    </button>
                    <button
                      onClick={() => {
                        playClickSound();
                        goBack();
                      }}
                      style={buttonStyle('#FF4500')}
                    >
                      ⬅️ Dashboard
                    </button>
                    <button
                      onClick={() => {
                        playClickSound();
                        restartGame();
                      }}
                      style={buttonStyle('#FF00FF')}
                    >
                      🔄 Restart
                    </button>
                  </div>
                </>
              )}

              {showOverlay === 'outro' && (
                <>
                  <h2
                    style={{
                      color: '#00FF00',
                      fontSize: 'clamp(20px, 6vw, 24px)',
                      textShadow: '0 0 8px #00FF00, 0 0 12px #00FF00',
                      fontWeight: '700',
                      marginBottom: '1rem',
                    }}
                  >
                    ✅ Loop Fixed! 🎉
                  </h2>
                  <p
                    style={{
                      color: '#E0FF00',
                      fontSize: 'clamp(13px, 3.5vw, 14px)',
                      margin: '0.5rem 0 1rem',
                      textShadow: '0 0 8px #E0FF00',
                    }}
                  >
                    Great job! Ready to test your knowledge?
                  </p>
                  <button
                    onClick={() => {
                      playClickSound();
                      setShowOverlay('quiz');
                    }}
                    style={buttonStyle('#00FF00')}
                  >
                    🧠 Take Quiz
                  </button>
                </>
              )}

              {showOverlay === 'quiz' && (
                <>
                  <h2
                    style={{
                      color: '#00FFFF',
                      fontSize: 'clamp(20px, 6vw, 24px)',
                      textShadow: '0 0 8px #00FFFF, 0 0 12px #00FFFF',
                      fontWeight: '700',
                      marginBottom: '1rem',
                    }}
                  >
                    🧠 Quiz Time! ❓
                  </h2>
                  <p
                    style={{
                      color: '#E0FF00',
                      fontSize: 'clamp(13px, 3.5vw, 14px)',
                      margin: '0.5rem 0 1rem',
                      textShadow: '0 0 8px #E0FF00',
                    }}
                  >
                    What were the errors in the loop?
                  </p>
                  {!quizPassed ? (
                    <>
                      <button
                        onClick={() => {
                          playClickSound();
                          handleQuizAnswer(true);
                        }}
                        style={buttonStyle('#00FF00')}
                      >
                        ✅ Initialization, condition, and decrement
                      </button>
                      <button
                        onClick={() => {
                          playClickSound();
                          handleQuizAnswer(false);
                        }}
                        style={buttonStyle('#FF0044')}
                      >
                        ❌ Missing semicolon
                      </button>
                    </>
                  ) : (
                    <p
                      style={{
                        color: '#00FF00',
                        fontSize: 'clamp(13px, 3.5vw, 14px)',
                        margin: '0.5rem 0',
                        textShadow: '0 0 8px #00FF00',
                      }}
                    >
                      Correct! The loop had incorrect initialization, condition, and used decrement instead of increment.
                    </p>
                  )}
                </>
              )}

              {showOverlay === 'stars' && (
                <>
                  <h2
                    style={{
                      color: '#00FFFF',
                      fontSize: 'clamp(20px, 6vw, 24px)',
                      textShadow: '0 0 8px #00FFFF, 0 0 12px #00FFFF',
                      fontWeight: '700',
                      marginBottom: '1rem',
                    }}
                  >
                    🏆 Level {level} Complete! ⭐
                  </h2>
                  <p
                    style={{
                      color: '#E0FF00',
                      fontSize: 'clamp(13px, 3.5vw, 14px)',
                      margin: '0.5rem 0',
                      textShadow: '0 0 8px #E0FF00',
                    }}
                  >
                    Final Score: {score} / 1000
                  </p>
                  <p
                    style={{
                      color: '#E0FF00',
                      fontSize: 'clamp(13px, 3.5vw, 14px)',
                      margin: '0.5rem 0',
                      textShadow: '0 0 8px #E0FF00',
                    }}
                  >
                    Time Taken: {time} seconds
                  </p>
                  <p
                    style={{
                      color: '#FFFF00',
                      fontSize: 'clamp(16px, 4.5vw, 18px)',
                      margin: '0.5rem 0',
                      textShadow: '0 0 8px #FFFF00, 0 0 12px #FFFF00',
                    }}
                  >
                    Rating: {'⭐'.repeat(stars)}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => {
                        playClickSound();
                        goBack();
                      }}
                      style={buttonStyle('#FF4500')}
                    >
                      ⬅️ Back
                    </button>
                    <button
                      onClick={() => {
                        playClickSound();
                        restartGame();
                      }}
                      style={buttonStyle('#FF00FF')}
                    >
                      🔄 Restart
                    </button>
                    <button
                      onClick={() => {
                        playClickSound();
                        goToNextLevel();
                      }}
                      style={buttonStyle('#00FF00')}
                    >
                      ➡️ Next Level
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {gameStarted && !codeSubmitted && (
          <div
            style={{
              position: 'absolute',
              top: 'clamp(3rem, 10vh, 4rem)',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'min(90%, 50rem)',
              color: '#00FFFF',
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 'clamp(20px, 4.5vw, 30px)',
              textAlign: 'center',
              textShadow: '0 0 8px #00FFFF, 0 0 12px #00FFFF',
              background: 'rgba(0, 0, 0, 0.7)',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid #00FFFF',
              boxShadow: '0 0 10px #00FFFF',
              zIndex: 1,
            }}
          >
            🚀 <strong>Mission: Save the Starship!</strong> The navigation system is malfunctioning, printing incorrect coordinates due to a buggy loop. Fix the loop to output coordinates 1 to 4 ("Number: 1" to "Number: 4"). Correct the initialization, condition, and increment to avoid asteroids and save the crew! 🪐
          </div>
        )}

        {gameStarted && (
          <>
            <AceEditor
              mode="c_cpp"
              theme="monokai"
              value={editorValue}
              onChange={setEditorValue}
              fontSize="clamp(14px, 3vw, 20px)"
              width="min(90%, 36rem)"
              height="clamp(10rem, 30vh, 12rem)"
              style={{
                position: 'absolute',
                bottom: 'clamp(4rem, 12vh, 5rem)',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1,
                borderRadius: '0.5rem',
                border: '2px solid #00FFFF',
                boxShadow: '0 0 10px #00FFFF, 0 0 15px #00FFFF',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
              }}
              setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                showPrintMargin: false,
              }}
            />

            {!codeSubmitted && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '0.5rem',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: 'min(90%, 36rem)',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <button
                  onClick={() => {
                    playClickSound();
                    setShowCodeEditor(true);
                  }}
                  style={{
                    ...buttonStyle('#FF00FF'),
                    flex: '1 1 clamp(7rem, 45%, 8rem)',
                  }}
                >
                  🧪 Test Code
                </button>
                <button
                  onClick={() => {
                    playClickSound();
                    submitCode();
                  }}
                  style={{
                    ...buttonStyle('#E0FF00', true),
                    flex: '1 1 clamp(7rem, 45%, 8rem)',
                  }}
                >
                  💾 Submit Code
                </button>
              </div>
            )}
          </>
        )}

        {showCodeEditor && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0, 0, 0, 0.9)',
              zIndex: 20,
              padding: 'clamp(0.5rem, 2vw, 1rem)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <h3
                style={{
                  color: '#00FFFF',
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: 'clamp(16px, 4.5vw, 18px)',
                  textShadow: '0 0 8px #00FFFF',
                }}
              >
                🧠 Code Testing
              </h3>
              <button
                onClick={() => {
                  playClickSound();
                  setShowCodeEditor(false);
                }}
                style={{
                  ...buttonStyle('#FF4500'),
                  padding: '0.5rem 0.75rem',
                  fontSize: 'clamp(12px, 3vw, 13px)',
                }}
              >
                Close
              </button>
            </div>
            <div style={{ flex: '1 1 auto', overflow: 'auto', marginBottom: '0.5rem' }}>
              <CodeMirror
                value={codeEditorCode}
                theme={oneDark}
                height="clamp(12rem, 35vh, 15rem)"
                extensions={[cpp()]}
                onChange={(value) => setCodeEditorCode(value)}
                style={{
                  fontSize: 'clamp(12px, 3vw, 13px)',
                  borderRadius: '0.5rem',
                  border: '2px solid #00FFFF',
                }}
              />
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <label
                style={{
                  color: '#E0FF00',
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: 'clamp(13px, 3.5vw, 14px)',
                  fontWeight: '700',
                  textShadow: '0 0 8px #E0FF00',
                  marginBottom: '0.5rem',
                  display: 'block',
                }}
              >
                Standard Input (Optional):
              </label>
              <textarea
                value={codeEditorInput}
                onChange={(e) => setCodeEditorInput(e.target.value)}
                style={{
                  width: '100%',
                  height: 'clamp(3rem, 10vh, 4rem)',
                  background: 'rgba(0, 0, 0, 0.8)',
                  color: '#fff',
                  border: '2px solid #00FFFF',
                  borderRadius: '0.5rem',
                  padding: '0.5rem',
                  fontFamily: 'monospace',
                  fontSize: 'clamp(12px, 3vw, 13px)',
                  resize: 'none',
                }}
              />
            </div>
            <div
              style={{
                flex: '1 1 auto',
                overflow: 'auto',
                background: 'rgba(0, 0, 0, 0.8)',
                borderRadius: '0.5rem',
                padding: '0.5rem',
                border: '2px solid #00FFFF',
                marginBottom: '0.5rem',
              }}
            >
              <strong
                style={{
                  color: '#E0FF00',
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: 'clamp(13px, 3.5vw, 14px)',
                  textShadow: '0 0 8px #E0FF00',
                }}
              >
                🔎 Output:
              </strong>
              <br />
              <pre
                style={{
                  color: '#fff',
                  fontSize: 'clamp(12px, 3vw, 13px)',
                  whiteSpace: 'pre-wrap',
                  margin: '0.5rem 0 0',
                }}
              >
                {codeEditorOutput}
              </pre>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                playClickSound();
                runCode();
              }}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: codeEditorLoading
                  ? 'linear-gradient(45deg, #666666CC, #666666FF)'
                  : 'linear-gradient(45deg, #00FF00CC, #00FF00FF)',
                color: '#fff',
                fontSize: 'clamp(13px, 3.5vw, 14px)',
                fontWeight: '700',
                borderRadius: '0.5rem',
                border: '2px solid #00FF00',
                cursor: codeEditorLoading ? 'not-allowed' : 'pointer',
                fontFamily: "'Orbitron', sans-serif",
                textShadow: '0 0 8px #00FF00',
                boxShadow: '0 0 10px #00FF00',
              }}
            >
              {codeEditorLoading ? '⏳ Running...' : '▶️ Run Code'}
            </motion.button>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default DebuggerGame;