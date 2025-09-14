
import React, { useState, useEffect, useRef } from 'react';
import door1 from '../../assets/images/level3/door1.png';
import door2 from '../../assets/images/level3/door2.png';
import door3 from '../../assets/images/level3/door3.png';
import door4 from '../../assets/images/level3/door4.png';
import door5 from '../../assets/images/level3/door5.png';
import bgMusic from '../../assets/sounds/level3/bg.mp3';
import clickSound from '../../assets/sounds/level3/click.wav';
import wrongSound from '../../assets/sounds/level3/wrong.wav';
import sparkleSound from '../../assets/sounds/level3/sparkle.mp3';
import axios from "axios";

const doors = [door1, door2, door3, door4, door5];
const houses = ['House 1', 'House 2', 'House 3', 'House 4', 'House 5'];

export default function MessengerGame() {
  const [step, setStep] = useState('intro');
  const [delivered, setDelivered] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState('');
  const [quizResult, setQuizResult] = useState(null);
  const [paused, setPaused] = useState(false);

  const bgRef = useRef(null);
  const clickRef = useRef(null);
  const wrongRef = useRef(null);
  const sparkleRef = useRef(null);
  const hasInteracted = useRef(false);

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
      postScore("Level 3", 100);
    }
  }, [step]);

  useEffect(() => {
    bgRef.current = new Audio(bgMusic);
    bgRef.current.loop = true;
    bgRef.current.volume = 0.3;

    clickRef.current = new Audio(clickSound);
    wrongRef.current = new Audio(wrongSound);
    sparkleRef.current = new Audio(sparkleSound);

    const tryPlayBg = () => {
      if (hasInteracted.current && bgRef.current && !paused) {
        bgRef.current.play().catch(error => {
          console.error('Background music playback failed:', error);
        });
      }
    };

    const handleInteraction = () => {
      if (!hasInteracted.current) {
        hasInteracted.current = true;
        tryPlayBg();
      }
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    bgRef.current.load();
    bgRef.current.oncanplaythrough = () => {
      console.log('Background music loaded successfully');
      tryPlayBg();
    };
    bgRef.current.onerror = () => {
      console.error('Failed to load background music. Check file path or CORS settings.');
    };

    return () => {
      if (bgRef.current) {
        bgRef.current.pause();
        bgRef.current = null;
      }
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [paused]);

  const playClick = () => {
    if (clickRef.current) {
      clickRef.current.currentTime = 0;
      clickRef.current.play().catch(error => {
        console.error('Click sound playback failed:', error);
      });
    }
  };

  const playWrong = () => {
    if (wrongRef.current) {
      wrongRef.current.currentTime = 0;
      wrongRef.current.play().catch(error => {
        console.error('Wrong sound playback failed:', error);
      });
    }
  };

  const playSparkle = () => {
    if (sparkleRef.current) {
      sparkleRef.current.currentTime = 0;
      sparkleRef.current.play().catch(error => {
        console.error('Sparkle sound playback failed:', error);
      });
    }
  };

  const deliverMessage = () => {
    if (delivered < houses.length && !paused) {
      playClick();
      setDelivered(delivered + 1);
    }
  };

  const checkAnswer = () => {
    if (!paused) {
      playClick();
      const correct = quizAnswer.trim() === '5';
      setQuizResult(correct);
      if (correct) playSparkle();
      else playWrong();
    }
  };

  const handleRestartGame = () => {
    playClick();
    setStep('intro');
    setDelivered(0);
    setQuizAnswer('');
    setQuizResult(null);
    setPaused(false);
  };

  const handleBackToDashboard = () => {
    window.location.href = '/dashboard';
    playClick();
    console.log('Back to Dashboard clicked');
  };

  const handleNextLevel = () => {
    window.location.href = '/LogicGame';
    playClick();
    console.log('Next Level clicked');
  };

  const score = 100;

  return (
    <div style={{
      fontFamily: "'Press Start 2P', cursive",
      margin: 0,
      backgroundColor: '#0d0d0d',
      color: '#f1f1f1',
      padding: 'clamp(1rem, 2vw, 2rem)',
      width: '100vw',
      height: '100vh',
      boxSizing: 'border-box',
      background: 'linear-gradient(to bottom, #0a0a0a, #1a1a1a)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      fontSize: 'clamp(16px, 2vw, 20px)'
    }}>
      {step === 'intro' && (
        <div style={{
          maxWidth: 'clamp(300px, 90vw, 800px)',
          width: '90%',
          textAlign: 'center',
          padding: 'clamp(1rem, 2vw, 2rem)',
          border: '2px solid #333',
          backgroundColor: '#1a1a1a',
          borderRadius: '16px',
          boxShadow: '0 0 20px #00ffcc44'
        }}>
          <h1 style={{
            color: '#00ffc8',
            textShadow: '0 0 5px #00ffc8, 0 0 10px #00ffc8',
            fontSize: 'clamp(24px, 4vw, 36px)'
          }}>📜 The Messenger</h1>
          <p style={{ margin: 'clamp(0.5rem, 1vw, 1rem) 0', fontSize: 'clamp(18px, 2.5vw, 24px)' }}>
            You will learn how <strong>for</strong> and <strong>while</strong> loops work by helping a messenger deliver messages to 5 houses.
          </p>
          <button
            onClick={() => { playClick(); setStep('game'); }}
            style={{
              backgroundColor: '#00ffd5',
              color: '#000',
              border: 'none',
              padding: 'clamp(10px, 2vw, 12px) clamp(20px, 4vw, 24px)',
              marginTop: 'clamp(0.5rem, 1vw, 1rem)',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: 'clamp(18px, 2.5vw, 20px)',
              cursor: 'pointer',
              boxShadow: '0 0 10px #00ffd5, 0 0 20px #00ffd5',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = '#00c2aa'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = '#00ffd5'}
          >
            Start
          </button>
        </div>
      )}

      {step === 'game' && (
        <div style={{
          maxWidth: 'clamp(300px, 90vw, 800px)',
          width: '90%',
          textAlign: 'center',
          padding: 'clamp(1rem, 2vw, 2rem)',
          border: '2px solid #333',
          backgroundColor: '#1a1a1a',
          borderRadius: '16px',
          boxShadow: '0 0 20px #00ffcc44'
        }}>
          <h2 style={{
            color: '#00ffc8',
            textShadow: '0 0 5px #00ffc8, 0 0 10px #00ffc8',
            fontSize: 'clamp(20px, 3vw, 30px)'
          }}>Deliver Messages</h2>
          <p style={{ margin: 'clamp(0.5rem, 1vw, 1rem) 0', fontSize: 'clamp(16px, 2vw, 22px)' }}>Click the button to deliver the message to each house.</p>
          <button
            onClick={deliverMessage}
            disabled={delivered === 5 || paused}
            style={{
              backgroundColor: (delivered === 5 || paused) ? '#ccc' : '#00ffd5',
              color: (delivered === 5 || paused) ? '#666' : '#000',
              border: 'none',
              padding: 'clamp(10px, 2vw, 12px) clamp(20px, 4vw, 24px)',
              marginTop: 'clamp(0.5rem, 1vw, 1rem)',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: 'clamp(18px, 2.5vw, 20px)',
              cursor: (delivered === 5 || paused) ? 'not-allowed' : 'pointer',
              boxShadow: (delivered === 5 || paused) ? 'none' : '0 0 10px #00ffd5, 0 0 20px #00ffd5',
              transition: 'all 0.3s ease',
              opacity: (delivered === 5 || paused) ? 0.6 : 1
            }}
            onMouseOver={e => !(delivered === 5 || paused) && (e.currentTarget.style.backgroundColor = '#00c2aa')}
            onMouseOut={e => !(delivered === 5 || paused) && (e.currentTarget.style.backgroundColor = '#00ffd5')}
          >
            Deliver Message
          </button>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'clamp(10px, 2vw, 20px)',
            flexWrap: 'wrap',
            marginTop: 'clamp(1rem, 2vw, 2rem)'
          }}>
            {houses.map((house, index) => (
              <div key={index} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                margin: 'clamp(0.5rem, 1vw, 1rem)'
              }}>
                <img
                  src={doors[index]}
                  alt={`Door ${index + 1}`}
                  style={{
                    width: 'clamp(60px, 15vw, 80px)',
                    height: 'auto',
                    filter: index < delivered
                      ? 'grayscale(0%) brightness(1.2) drop-shadow(0 0 10px #00ffcc)'
                      : 'grayscale(100%) brightness(0.7)',
                    transition: 'filter 0.3s, transform 0.3s ease',
                    transform: index < delivered ? 'scale(1.05)' : 'scale(1)'
                  }}
                />
                <p style={{ margin: 'clamp(0.2rem, 0.5vw, 0.5rem) 0', fontSize: 'clamp(14px, 2vw, 18px)' }}>{house}</p>
                {index < delivered && (
                  <span style={{
                    marginTop: 'clamp(0.2rem, 0.5vw, 0.5rem)',
                    color: '#00ffcc',
                    fontWeight: 'bold',
                    fontSize: 'clamp(14px, 2vw, 18px)'
                  }}>📬 Delivered!</span>
                )}
              </div>
            ))}
          </div>
          {delivered === 5 && (
            <button
              onClick={() => { playClick(); setStep('outro'); }}
              style={{
                backgroundColor: '#00ffd5',
                color: '#000',
                border: 'none',
                padding: 'clamp(10px, 2vw, 12px) clamp(20px, 4vw, 24px)',
                marginTop: 'clamp(0.5rem, 1vw, 1rem)',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: 'clamp(18px, 2.5vw, 20px)',
                cursor: 'pointer',
                boxShadow: '0 0 10px #00ffd5, 0 0 20px #00ffd5',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#00c2aa'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = '#00ffd5'}
            >
              Continue
            </button>
          )}
          <button
            style={{
              position: 'fixed',
              top: 'clamp(10px, 2vw, 20px)',
              right: 'clamp(10px, 2vw, 20px)',
              backgroundColor: '#ff4444',
              color: '#fff',
              border: 'none',
              padding: 'clamp(8px, 1.5vw, 10px) clamp(15px, 3vw, 20px)',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: 'clamp(16px, 2vw, 18px)',
              cursor: 'pointer',
              boxShadow: '0 0 10px #ff4444, 0 0 20px #ff4444',
              transition: 'all 0.3s ease',
              zIndex: 1000
            }}
            onClick={() => setPaused(true)}
          >
            Pause
          </button>
          <div style={{ ...styles.backdrop, display: paused ? 'block' : 'none' }} />
          <div style={{ ...styles.popup, display: paused ? 'flex' : 'none' }}>
            <button style={styles.popupButton} onClick={() => setPaused(false)}>Resume</button>
            <button style={styles.popupButton} onClick={handleRestartGame}>Restart</button>
            <button style={styles.popupButton} onClick={handleBackToDashboard}>Dashboard</button>
          </div>
        </div>
      )}

      {step === 'outro' && (
        <div style={{
          maxWidth: 'clamp(300px, 90vw, 800px)',
          width: '90%',
          textAlign: 'center',
          padding: 'clamp(1rem, 2vw, 2rem)',
          border: '2px solid #333',
          backgroundColor: '#1a1a1a',
          borderRadius: '16px',
          boxShadow: '0 0 20px #00ffcc44'
        }}>
          <h2 style={{
            color: '#00ffc8',
            textShadow: '0 0 5px #00ffc8, 0 0 10px #00ffc8',
            fontSize: 'clamp(20px, 3vw, 30px)'
          }}>Loops in Action</h2>
          <p style={{ margin: 'clamp(0.5rem, 1vw, 1rem) 0', fontSize: 'clamp(16px, 2vw, 22px)' }}>This is how a <strong>for loop</strong> automates repetitive tasks:</p>
          <pre style={{
            backgroundColor: '#0f0f0f',
            padding: 'clamp(0.5rem, 1vw, 1rem)',
            borderRadius: '10px',
            color: '#0ff',
            textAlign: 'left',
            margin: 'clamp(0.5rem, 1vw, 1rem) auto',
            overflowX: 'auto',
            maxWidth: '100%',
            fontSize: 'clamp(14px, 2vw, 18px)'
          }}>{`for (let i = 0; i < 5; i++) {\n  deliverMessage();\n}`}</pre>
          <p style={{ margin: 'clamp(0.5rem, 1vw, 1rem) 0', fontSize: 'clamp(16px, 2vw, 22px)' }}>And with a <strong>while loop</strong>:</p>
          <pre style={{
            backgroundColor: '#0f0f0f',
            padding: 'clamp(0.5rem, 1vw, 1rem)',
            borderRadius: '10px',
            color: '#0ff',
            textAlign: 'left',
            margin: 'clamp(0.5rem, 1vw, 1rem) auto',
            overflowX: 'auto',
            maxWidth: '100%',
            fontSize: 'clamp(14px, 2vw, 18px)'
          }}>{`let i = 0;\nwhile (i < 5) {\n  deliverMessage();\n  i++;\n}`}</pre>
          <button
            onClick={() => { playClick(); setStep('quiz'); }}
            style={{
              backgroundColor: '#00ffd5',
              color: '#000',
              border: 'none',
              padding: 'clamp(10px, 2vw, 12px) clamp(20px, 4vw, 24px)',
              marginTop: 'clamp(0.5rem, 1vw, 1rem)',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: 'clamp(18px, 2.5vw, 20px)',
              cursor: 'pointer',
              boxShadow: '0 0 10px #00ffd5, 0 0 20px #00ffd5',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = '#00c2aa'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = '#00ffd5'}
          >
            Next
          </button>
        </div>
      )}

      {step === 'quiz' && (
        <div style={{
          maxWidth: 'clamp(300px, 90vw, 800px)',
          width: '90%',
          textAlign: 'center',
          padding: 'clamp(1rem, 2vw, 2rem)',
          border: '2px solid #333',
          backgroundColor: '#1a1a1a',
          borderRadius: '16px',
          boxShadow: '0 0 20px #00ffcc44'
        }}>
          <h2 style={{
            color: '#00ffc8',
            textShadow: '0 0 5px #00ffc8, 0 0 10px #00ffc8',
            fontSize: 'clamp(20px, 3vw, 30px)'
          }}>Quiz</h2>
          <p style={{ margin: 'clamp(0.5rem, 1vw, 1rem) 0', fontSize: 'clamp(16px, 2vw, 22px)' }}>How many times does this loop run?</p>
          <pre style={{
            backgroundColor: '#0f0f0f',
            padding: 'clamp(0.5rem, 1vw, 1rem)',
            borderRadius: '10px',
            color: '#0ff',
            textAlign: 'left',
            margin: 'clamp(0.5rem, 1vw, 1rem) auto',
            overflowX: 'auto',
            maxWidth: '100%',
            fontSize: 'clamp(14px, 2vw, 18px)'
          }}>{`for (let i = 0; i < 5; i++) {\n  deliverMessage();\n}`}</pre>
          <input
            value={quizAnswer}
            onChange={(e) => setQuizAnswer(e.target.value)}
            placeholder="Your answer"
            style={{
              padding: 'clamp(8px, 1.5vw, 10px)',
              borderRadius: '8px',
              border: '2px solid #00ffd5',
              backgroundColor: '#121212',
              color: '#fff',
              fontSize: 'clamp(16px, 2vw, 18px)',
              margin: 'clamp(0.5rem, 1vw, 1rem)',
              width: 'clamp(150px, 30vw, 200px)',
              textAlign: 'center'
            }}
          />
          <button
            onClick={checkAnswer}
            disabled={paused}
            style={{
              backgroundColor: paused ? '#ccc' : '#00ffd5',
              color: paused ? '#666' : '#000',
              border: 'none',
              padding: 'clamp(10px, 2vw, 12px) clamp(20px, 4vw, 24px)',
              marginTop: 'clamp(0.5rem, 1vw, 1rem)',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: 'clamp(18px, 2.5vw, 20px)',
              cursor: paused ? 'not-allowed' : 'pointer',
              boxShadow: paused ? 'none' : '0 0 10px #00ffd5, 0 0 20px #00ffd5',
              transition: 'all 0.3s ease',
              opacity: paused ? 0.6 : 1
            }}
            onMouseOver={e => !paused && (e.currentTarget.style.backgroundColor = '#00c2aa')}
            onMouseOut={e => !paused && (e.currentTarget.style.backgroundColor = '#00ffd5')}
          >
            Submit
          </button>
          {quizResult !== null && (
            <>
              <p style={{ margin: 'clamp(0.5rem, 1vw, 1rem) 0', fontSize: 'clamp(16px, 2vw, 22px)' }}>{quizResult ? '✅ Correct!' : '❌ Try again.'}</p>
              {quizResult && (
                <button
                  onClick={() => { playClick(); setStep('rating'); }}
                  style={{
                    backgroundColor: '#00ffd5',
                    color: '#000',
                    border: 'none',
                    padding: 'clamp(10px, 2vw, 12px) clamp(20px, 4vw, 24px)',
                    marginTop: 'clamp(0.5rem, 1vw, 1rem)',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: 'clamp(18px, 2.5vw, 20px)',
                    cursor: 'pointer',
                    boxShadow: '0 0 10px #00ffd5, 0 0 20px #00ffd5',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = '#00c2aa'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = '#00ffd5'}
                >
                  Continue
                </button>
              )}
            </>
          )}
          <button
            style={{
              position: 'fixed',
              top: 'clamp(10px, 2vw, 20px)',
              right: 'clamp(10px, 2vw, 20px)',
              backgroundColor: '#ff4444',
              color: '#fff',
              border: 'none',
              padding: 'clamp(8px, 1.5vw, 10px) clamp(15px, 3vw, 20px)',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: 'clamp(16px, 2vw, 18px)',
              cursor: 'pointer',
              boxShadow: '0 0 10px #ff4444, 0 0 20px #ff4444',
              transition: 'all 0.3s ease',
              zIndex: 1000
            }}
            onClick={() => setPaused(true)}
          >
            Pause
          </button>
          <div style={{ ...styles.backdrop, display: paused ? 'block' : 'none' }} />
          <div style={{ ...styles.popup, display: paused ? 'flex' : 'none' }}>
            <button style={styles.popupButton} onClick={() => setPaused(false)}>Resume</button>
            <button style={styles.popupButton} onClick={handleRestartGame}>Restart</button>
            <button style={styles.popupButton} onClick={handleBackToDashboard}>Dashboard</button>
          </div>
        </div>
      )}

      {step === 'rating' && (
        <div style={{
          maxWidth: 'clamp(300px, 90vw, 800px)',
          width: '90%',
          textAlign: 'center',
          padding: 'clamp(1rem, 2vw, 2rem)',
          border: '2px solid #333',
          backgroundColor: '#1a1a1a',
          borderRadius: '16px',
          boxShadow: '0 0 20px #00ffcc44'
        }}>
          <h2 style={{
            color: '#00ffc8',
            textShadow: '0 0 5px #00ffc8, 0 0 10px #00ffc8',
            fontSize: 'clamp(20px, 3vw, 30px)'
          }}>🎉 Great Job!</h2>
          <p style={{ margin: 'clamp(0.5rem, 1vw, 1rem) 0', fontSize: 'clamp(16px, 2vw, 22px)' }}>You helped the messenger deliver all messages efficiently using loops!</p>
          <div style={{
            backgroundColor: '#003300',
            border: '2px solid #00ff00',
            padding: 'clamp(1rem, 2vw, 30px)',
            marginTop: 'clamp(1rem, 2vw, 30px)',
            borderRadius: '20px',
            boxShadow: '0 0 15px #00ff00, 0 0 25px #00ff00, 0 0 40px #00ff00',
            animation: 'glowPulse 2s infinite alternate'
          }}>
            <div style={{
              fontSize: 'clamp(24px, 4vw, 40px)',
              color: 'gold',
              textShadow: '0 0 10px gold',
              marginBottom: 'clamp(0.5rem, 1vw, 10px)'
            }}>⭐️⭐️⭐️</div>
            <div style={{
              fontSize: 'clamp(18px, 2.5vw, 24px)',
              color: '#00ffcc',
              fontWeight: 'bold'
            }}>Score: {score} pts</div>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'clamp(5px, 1vw, 10px)',
            marginTop: 'clamp(1rem, 2vw, 2rem)',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={handleRestartGame}
              style={{
                backgroundColor: '#00ffd5',
                color: '#000',
                border: 'none',
                padding: 'clamp(10px, 2vw, 12px) clamp(20px, 4vw, 24px)',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: 'clamp(18px, 2.5vw, 20px)',
                cursor: 'pointer',
                boxShadow: '0 0 10px #00ffd5, 0 0 20px #00ffd5',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#00c2aa'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = '#00ffd5'}
            >
              Restart Game
            </button>
            <button
              onClick={handleBackToDashboard}
              style={{
                backgroundColor: '#00ffd5',
                color: '#000',
                border: 'none',
                padding: 'clamp(10px, 2vw, 12px) clamp(20px, 4vw, 24px)',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: 'clamp(18px, 2.5vw, 20px)',
                cursor: 'pointer',
                boxShadow: '0 0 10px #00ffd5, 0 0 20px #00ffd5',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#00c2aa'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = '#00ffd5'}
            >
              Back to Dashboard
            </button>
            <button
              onClick={handleNextLevel}
              style={{
                backgroundColor: '#00ffd5',
                color: '#000',
                border: 'none',
                padding: 'clamp(10px, 2vw, 12px) clamp(20px, 4vw, 24px)',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: 'clamp(18px, 2.5vw, 20px)',
                cursor: 'pointer',
                boxShadow: '0 0 10px #00ffd5, 0 0 20px #00ffd5',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#00c2aa'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = '#00ffd5'}
            >
              Next Level
            </button>
          </div>
        </div>
      )}
      <style>{`
        @keyframes glowPulse {
          from {
            box-shadow: 0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 30px #00ff00;
          }
          to {
            box-shadow: 0 0 20px #00ff00, 0 0 35px #00ff00, 0 0 50px #00ff00;
          }
        }
        @media (max-width: 768px) {
          body { font-size: clamp(14px, 2vw, 18px); }
          h1 { font-size: clamp(20px, 3.5vw, 30px); }
          h2 { font-size: clamp(18px, 3vw, 25px); }
          p, .quizLabel { font-size: clamp(14px, 2vw, 18px); }
          button { font-size: clamp(16px, 2.5vw, 18px); padding: clamp(8px, 1.5vw, 10px) clamp(15px, 3vw, 20px); }
          input { font-size: clamp(14px, 2vw, 16px); width: clamp(120px, 25vw, 180px); }
          img { width: clamp(50px, 12vw, 70px); }
          .doors { flex-direction: column; gap: clamp(5px, 1.5vw, 10px); }
          .buttonContainer { flex-direction: column; gap: clamp(5px, 1.5vw, 10px); }
          .popup { max-width: clamp(200px, 70vw, 400px); }
          .popupButton { font-size: clamp(14px, 2vw, 16px); padding: clamp(6px, 1.5vw, 8px) clamp(12px, 2.5vw, 15px); }
        }
        @media (max-width: 480px) {
          body { font-size: clamp(12px, 2vw, 16px); }
          h1 { font-size: clamp(18px, 3vw, 25px); }
          h2 { font-size: clamp(16px, 2.5vw, 20px); }
          p, .quizLabel { font-size: clamp(12px, 1.5vw, 16px); }
          button { font-size: clamp(14px, 2vw, 16px); padding: clamp(6px, 1.2vw, 8px) clamp(12px, 2vw, 15px); }
          input { font-size: clamp(12px, 1.5vw, 14px); width: clamp(100px, 20vw, 150px); }
          img { width: clamp(40px, 10vw, 60px); }
          .doors { gap: clamp(3px, 1vw, 5px); }
          .buttonContainer { gap: clamp(3px, 1vw, 5px); }
          .popup { max-width: clamp(180px, 65vw, 350px); }
          .popupButton { font-size: clamp(12px, 1.8vw, 14px); padding: clamp(5px, 1vw, 6px) clamp(10px, 2vw, 12px); }
        }
      `}</style>
      {styles.backdrop && styles.popup && (
        <style>{`
          .backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.5);
            zIndex: 1000;
          }
          .popup {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            padding: clamp(1rem, 2vw, 2rem);
            borderRadius: 10px;
            border: 2px solid #39ff14;
            boxShadow: 0 0 20px #39ff14;
            flexDirection: column;
            alignItems: center;
            gap: clamp(0.5rem, 1vw, 1rem);
            zIndex: 2000;
          }
          .popupButton {
            backgroundColor: '#00ffd5',
            color: '#000',
            border: 'none',
            padding: 'clamp(8px, 1.5vw, 10px) clamp(15px, 3vw, 20px)',
            margin: 'clamp(0.5rem, 1vw, 1rem)',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: 'clamp(16px, 2vw, 18px)',
            cursor: 'pointer',
            boxShadow: '0 0 10px #00ffd5, 0 0 20px #00ffd5',
            transition: 'all 0.3s ease'
          }
          .popupButton:hover {
            backgroundColor: '#00c2aa';
          }
        `}</style>
      )}
    </div>
  );
}

const styles = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  popup: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'rgba(0, 0, 0, 0.9)',
    padding: 'clamp(1rem, 2vw, 2rem)',
    borderRadius: '10px',
    border: '2px solid #39ff14',
    boxShadow: '0 0 20px #39ff14',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'clamp(0.5rem, 1vw, 1rem)',
    zIndex: 2000,
  },
  popupButton: {
    backgroundColor: '#00ffd5',
    color: '#000',
    border: 'none',
    padding: 'clamp(8px, 1.5vw, 10px) clamp(15px, 3vw, 20px)',
    margin: 'clamp(0.5rem, 1vw, 1rem)',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: 'clamp(16px, 2vw, 18px)',
    cursor: 'pointer',
    boxShadow: '0 0 10px #00ffd5, 0 0 20px #00ffd5',
    transition: 'all 0.3s ease'
  }
};
