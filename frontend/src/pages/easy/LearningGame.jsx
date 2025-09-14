
import React, { useState, useEffect, useRef } from 'react';
import wizardImg from '../../assets/images/level2/wizard.png';
import cauldronImg from '../../assets/images/level2/caludron.png';
import appleImg from '../../assets/images/level2/apple.png';
import numberImg from '../../assets/images/level2/number.png';
import trueImg from '../../assets/images/level2/true.png';
import helloImg from '../../assets/images/level2/hello.png';
import fortyTwoImg from '../../assets/images/level2/ninety.png';
import falseImg from '../../assets/images/level2/false.png';
import wizardAudio from '../../assets/sounds/level2/wizard.mp3';
import sparkleAudio from '../../assets/sounds/level2/sparkle.mp3';
import wrongAudio from '../../assets/sounds/level2/wrong.wav';
import axios from 'axios';

const LearningGame = () => {
  const [stage, setStage] = useState('intro');
  const [score, setScore] = useState(0);
  const [paused, setPaused] = useState(false);
  const bgMusicRef = useRef(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [introText, setIntroText] = useState('');
  const [introDone, setIntroDone] = useState(false);

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

  const nextStage = (newStage, finalScore) => {
    if (finalScore !== undefined) setScore(finalScore);
    setStage(newStage);
    setPaused(false);
  };

  const navigateToDashboard = () => {
    console.log('Navigating to dashboard...');
    window.location.href = '/dashboard';
  };

  const navigateToNextLevel = () => {
    console.log('Navigating to next level...');
    window.location.href = '/Messenger';
  };

  // Handle intro text animation at top level to run only once
  useEffect(() => {
    if (stage === 'game' && !introDone) {
      const fullIntro = 'This is the wizard with his cauldron. Help him mix the right items to create a magical potion!';
      let i = 0;
      const typeInterval = setInterval(() => {
        if (i < fullIntro.length) {
          setIntroText((prev) => prev + fullIntro[i]);
          i++;
        } else {
          clearInterval(typeInterval);
          setTimeout(() => setIntroDone(true), 1500);
        }
      }, 40);
      return () => clearInterval(typeInterval);
    }
  }, [stage, introDone]);

  // Handle pause audio
  useEffect(() => {
    if (bgMusicRef.current) {
      if (paused || stage === 'quiz') {
        bgMusicRef.current.pause();
      } else if (hasInteracted) {
        bgMusicRef.current.play().catch((error) => console.error('Error playing background music:', error));
      }
    }
  }, [paused, stage, hasInteracted]);

  // Intro Component
  const Intro = ({ onNext }) => {
    const clickSoundRef = useRef(null);

    const handleClick = () => {
      const clickSound = clickSoundRef.current;
      if (clickSound) {
        clickSound.currentTime = 0;
        clickSound.volume = 0.8;
        clickSound.play().catch((error) => console.error('Error playing click sound:', error));
      }
      if (bgMusicRef.current && !hasInteracted) {
        bgMusicRef.current.volume = 0.5;
        bgMusicRef.current.loop = true;
        bgMusicRef.current.play().catch((error) => console.error('Error playing background music:', error));
        setHasInteracted(true);
      }
      onNext();
    };

    return (
      <div style={styles.screen}>
        <audio ref={clickSoundRef} src={sparkleAudio} preload="auto" />
        <h1 style={styles.introTitle}>🧪 Potion Mixing</h1>
        <p style={styles.introText}>
          Help the wizard mix the correct potions by choosing ingredients that match the required <strong>data type</strong>.
        </p>
        <p style={styles.introText}>
          Types: <strong>string</strong>, <strong>number</strong>, <strong>boolean</strong>
        </p>
        <button style={styles.introButton} onClick={handleClick}>
          Begin Potion Mixing
        </button>
      </div>
    );
  };

  // Game Component
  const Game = ({ onNext, onRestart }) => {
    const ingredients = [
      { id: 1, name: '"apple"', type: 'string', image: appleImg },
      { id: 2, name: '42', type: 'number', image: numberImg },
      { id: 3, name: 'true', type: 'boolean', image: trueImg },
      { id: 4, name: '"hello"', type: 'string', image: helloImg },
      { id: 5, name: '99', type: 'number', image: fortyTwoImg },
      { id: 6, name: 'false', type: 'boolean', image: falseImg },
    ];

    const [targetType, setTargetType] = useState('string');
    const [usedIds, setUsedIds] = useState([]);
    const [gameScore, setGameScore] = useState(0);
    const [time, setTime] = useState(0);
    const [showOutro, setShowOutro] = useState(false);

    useEffect(() => {
      if (!paused) {
        const timer = setInterval(() => setTime((t) => t + 1), 1000);
        return () => clearInterval(timer);
      }
    }, [paused]);

    useEffect(() => {
      const unlockAudio = () => {
        const audio = new Audio();
        audio.play().catch(() => {});
        window.removeEventListener('click', unlockAudio);
      };
      window.addEventListener('click', unlockAudio);
      return () => window.removeEventListener('click', unlockAudio);
    }, []);

    useEffect(() => {
      if (usedIds.length === ingredients.length) {
        setTimeout(() => {
          setShowOutro(true);
        }, 1000);
      }
    }, [usedIds]);

    const handleSelect = (ingredient) => {
      if (usedIds.includes(ingredient.id) || paused) return;

      const sparkle = new Audio(sparkleAudio);
      const wrong = new Audio(wrongAudio);

      if (ingredient.type === targetType) {
        sparkle.volume = 0.7;
        sparkle.play().catch((error) => console.error('Error playing sparkle sound:', error));
        setGameScore((prev) => prev + 10);
      } else {
        wrong.volume = 0.7;
        wrong.play().catch((error) => console.error('Error playing wrong sound:', error));
        setGameScore((prev) => Math.max(0, prev - 5));
      }

      setUsedIds([...usedIds, ingredient.id]);

      const nextTypes = ['string', 'number', 'boolean'];
      setTimeout(() => {
        setTargetType(nextTypes[(nextTypes.indexOf(targetType) + 1) % 3]);
      }, 500);
    };

    const handleRestart = () => {
      setGameScore(0);
      setTime(0);
      setUsedIds([]);
      setTargetType('string');
      setShowOutro(false);
      setPaused(false);
      setIntroText('');
      setIntroDone(false);
      onRestart();
    };

    if (showOutro) {
      return <Outro score={gameScore} time={time} onNext={() => onNext(gameScore)} />;
    }

    return (
      <div style={styles.gameUi}>
        {!introDone && <div style={styles.introText}>{introText}</div>}
        {introDone && !showOutro && (
          <>
            <header style={styles.gameHeader}>
              <div style={styles.wizardCauldronContainer}>
                <img src={wizardImg} alt="Wizard" style={styles.wizard} />
                <img src={cauldronImg} alt="Cauldron" style={styles.cauldron} />
              </div>
              <h2 style={styles.h2}>
                The cauldron needs a <span style={styles.type}>{targetType}</span> ingredient!
              </h2>
              <div style={styles.scoreTimer}>
                <p>⏱ Time: {time}s</p>
                <p>⭐ Score: {gameScore}</p>
              </div>
            </header>
            <section style={styles.ingredients}>
              {ingredients.map((ing) => (
                <button
                  key={ing.id}
                  onClick={() => handleSelect(ing)}
                  disabled={usedIds.includes(ing.id) || paused}
                  style={{
                    ...styles.card,
                    ...(usedIds.includes(ing.id) ? styles.cardDisabled : styles.cardWiggle),
                  }}
                >
                  <img src={ing.image} alt={ing.name} style={styles.cardImg} />
                  <p style={styles.cardText}>{ing.name}</p>
                </button>
              ))}
            </section>
            <button style={styles.pauseButton} onClick={() => setPaused(true)}>
              Pause
            </button>
            <div style={{ ...styles.backdrop, display: paused ? 'block' : 'none' }} />
            <div style={{ ...styles.popup, display: paused ? 'flex' : 'none' }}>
              <button style={styles.popupButton} onClick={() => setPaused(false)}>
                Resume
              </button>
              <button style={styles.popupButton} onClick={navigateToDashboard}>
                Dashboard
              </button>
              <button style={styles.popupButton} onClick={handleRestart}>
                Restart
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  // Outro Component
  const Outro = ({ score, time, onNext }) => {
    return (
      <div style={styles.screen}>
        <h2 style={styles.h2}>🧙 Magic Revealed!</h2>
        <p style={styles.outroText}>
          In JavaScript, <code>"2" + 2</code> results in <code>"22"</code> because <strong>string + number = string</strong>.
        </p>
        <p style={styles.outroText}>This is due to type coercion. Always be mindful of data types!</p>
        <button style={styles.button} onClick={onNext}>
          Continue to Quiz
        </button>
      </div>
    );
  };

  // Quiz Component
  const Quiz = () => {
    const [selected, setSelected] = useState('');
    const [startTime, setStartTime] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [quizScore, setQuizScore] = useState(0);

    useEffect(() => {
      setStartTime(Date.now());
    }, []);

    useEffect(() => {
      if (showResult) {
        postScore('Level 2', quizScore);
      }
    }, [showResult, quizScore]);

    const handleSubmit = () => {
      const endTime = Date.now();
      const timeTaken = (endTime - startTime) / 1000;
      const correctAnswer = '"22"';
      const correct = selected === correctAnswer;
      let finalScore = 100 - Math.min(timeTaken * 2, 50);
      if (!correct) finalScore -= 20;
      finalScore = Math.max(Math.round(finalScore), 0);

      setIsCorrect(correct);
      setQuizScore(finalScore);
      setSubmitted(true);

      setTimeout(() => {
        setShowResult(true);
      }, 1500);
    };

    const getStarRating = (score) => {
      if (score >= 80) return '⭐️⭐️⭐️';
      if (score >= 50) return '⭐️⭐️';
      return '⭐️';
    };

    const getFeedback = (score) => {
      if (score >= 80) return '🎉 Amazing! You\'re a coding legend! ✨';
      if (score >= 50) return '👍 Good job, keep practicing! 💡';
      return '😟 Don\'t worry, keep going and you\'ll improve! 🚀';
    };

    if (showResult) {
      return (
        <div style={styles.quizContainer}>
          <h2 style={styles.quizTitle}>📊 Result</h2>
          <p style={styles.score}>Your Score: <strong>{quizScore}</strong></p>
          <p style={styles.stars}>Rating: {getStarRating(quizScore)}</p>
          <p style={styles.emojiFeedback}>{getFeedback(quizScore)}</p>
          <div style={styles.buttonContainer}>
            <button style={styles.retryButton} onClick={() => {
              setStage('intro');
              setScore(0);
              setPaused(false);
              setIntroText('');
              setIntroDone(false);
            }}>
              🔄 Try Again
            </button>
            <button style={styles.backButton} onClick={navigateToDashboard}>
              🏠 Back to Dashboard
            </button>
            <button style={styles.nextLevelButton} onClick={navigateToNextLevel}>
              ➡️ Next Level
            </button>
          </div>
        </div>
      );
    }

    return (
      <div style={styles.quizContainer}>
        {!submitted ? (
          <>
            <h2 style={styles.quizTitle}>🧪 Quick Quiz</h2>
            <p style={styles.quizQuestion}>
              What is the result of <code>"2" + 2</code> in JavaScript?
            </p>
            <div style={styles.quizOptions}>
              <label style={styles.quizLabel}>
                <input
                  type="radio"
                  value="4"
                  checked={selected === '4'}
                  onChange={(e) => setSelected(e.target.value)}
                  style={styles.radioInput}
                />
                4
              </label>
              <label style={styles.quizLabel}>
                <input
                  type="radio"
                  value='"22"'
                  checked={selected === '"22"'}
                  onChange={(e) => setSelected(e.target.value)}
                  style={styles.radioInput}
                />
                "22"
              </label>
              <label style={styles.quizLabel}>
                <input
                  type="radio"
                  value="NaN"
                  checked={selected === 'NaN'}
                  onChange={(e) => setSelected(e.target.value)}
                  style={styles.radioInput}
                />
                NaN
              </label>
            </div>
            <button
              style={{ ...styles.button, ...(selected ? {} : styles.buttonDisabled) }}
              onClick={handleSubmit}
              disabled={!selected}
            >
              Submit
            </button>
          </>
        ) : (
          <div style={styles.answerReveal}>
            <h2 style={styles.answerRevealH2}>
              {isCorrect ? '✅ Correct!' : '❌ Incorrect, the correct answer is "22".'}
            </h2>
          </div>
        )}
      </div>
    );
  };

  const styles = {
    app: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100vw',
      height: '100vh',
      margin: 0,
      padding: 0,
      background: 'linear-gradient(135deg, #1e1e1e, #111)',
      fontFamily: "'Orbitron', sans-serif",
      color: '#fff',
      overflow: 'hidden',
      boxShadow: 'inset 0 0 50px #ff00ff, inset 0 0 100px #00ffcc',
    },
    screen: {
      width: '100%',
      height: '100%',
      maxWidth: 'none',
      margin: 0,
      padding: '1rem',
      textAlign: 'center',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'rgba(30, 30, 30, 0.8)',
      boxShadow: 'inset 0 0 20px #00ffcc',
    },
    introTitle: {
      fontSize: 'clamp(2rem, 5vw, 3rem)',
      color: '#fff',
      textShadow: '0 0 15px #ff00ff, 0 0 25px #ff00ff, 0 0 35px #ff00ff',
      marginBottom: '20px',
    },
    introText: {
      fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
      margin: '15px 0',
      color: '#fff',
      textShadow: '0 0 10px #00ffcc, 0 0 20px #00ffcc, 0 0 30px #00ffcc',
      whiteSpace: 'pre-wrap',
      marginTop: '30px',
      lineheight: 2,
    },
    introButton: {
      backgroundColor: '#333',
      color: '#fff',
      textShadow: '0 0 15px #00ffcc, 0 0 25px #00ffcc',
      border: 'none',
      padding: 'clamp(0.8rem, 2vw, 1.2rem) clamp(1.6rem, 4vw, 2.4rem)',
      fontSize: 'clamp(1rem, 2.5vw, 1.6rem)',
      fontFamily: "'Orbitron', sans-serif",
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.3s ease',
      marginTop: '100px',
      borderRadius: '10px',
      boxShadow: '0 0 20px #00ffcc, 0 0 30px #00ffcc',
      minWidth: 'clamp(200px, 40vw, 300px)',
      transform: 'scale(1)',
    },
    gameUi: {
      fontFamily: "'Orbitron', sans-serif",
      textAlign: 'center',
      padding: 'clamp(10px, 2vw, 20px)',
      backgroundColor: '#1a1a1a',
      color: '#fff',
      width: '100vw',
      height: '100vh',
      margin: 0,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      boxShadow: 'inset 0 0 30px #ff00ff',
    },
    gameHeader: {
      marginTop: '10px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
    },
    wizardCauldronContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 'clamp(10px, 2vw, 20px)',
      marginBottom: '10px',
    },
    wizard: {
      width: 'clamp(100px, 20vw, 160px)',
      transform: 'translateY(0)',
      transition: 'transform 1.5s ease-in-out',
    },
    cauldron: {
      width: 'clamp(60px, 15vw, 100px)',
      transform: 'scale(1)',
      transition: 'transform 1s ease-in-out',
    },
    h2: {
      fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
      marginTop: '20px',
      lineHeight: '1.5',
      color: '#fff',
      textShadow: '0 0 15px #ff00ff, 0 0 25px #ff00ff, 0 0 35px #ff00ff',
    },
    type: {
      fontWeight: 'bold',
      color: '#00ffcc',
      textShadow: '0 0 15px #00ff99, 0 0 25px #00ff99, 0 0 35px #00ff99',
    },
    scoreTimer: {
      fontSize: 'clamp(16px, 3vw, 22px)',
      color: '#ffcc00',
      marginTop: '10px',
      display: 'flex',
      justifyContent: 'space-between',
      width: 'clamp(80%, 90vw, 90%)',
      textShadow: '0 0 10px #00ff00, 0 0 20px #00ff00',
      padding: '10px',
    },
    ingredients: {
      marginTop: '20px',
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 'clamp(10px, 2vw, 15px)',
      overflowX: 'auto',
      padding: '10px',
      scrollbarWidth: 'none',
      width: '100%',
    },
    card: {
      backgroundColor: '#333',
      padding: 'clamp(10px, 2vw, 20px)',
      borderRadius: '12px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.3s ease',
      minWidth: 'clamp(100px, 20vw, 160px)',
      flexShrink: 0,
      border: 'none',
      boxShadow: '0 0 15px #00ffcc, 0 0 25px #00ffcc',
      transform: 'scale(1)',
    },
    cardImg: {
      width: 'clamp(50px, 15vw, 80px)',
      height: 'clamp(50px, 15vw, 80px)',
      transition: 'transform 0.2s ease',
    },
    cardText: {
      marginTop: '10px',
      fontSize: 'clamp(14px, 3vw, 18px)',
      color: '#ffcc00',
      textShadow: '0 0 10px #ffcc00, 0 0 20px #ffcc00',
    },
    cardDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
      boxShadow: '0 0 5px #666',
      transform: 'scale(0.95)',
    },
    cardWiggle: {
      transform: 'rotate(0deg)',
      transition: 'transform 1s ease-in-out',
    },
    quizContainer: {
      width: '100%',
      maxWidth: 'clamp(400px, 80vw, 800px)',
      margin: '0 auto',
      background: '#1e1e2f',
      color: 'white',
      padding: 'clamp(10px, 2vw, 20px)',
      borderRadius: '15px',
      boxShadow: '0 0 25px #00ffcc, 0 0 40px #00ffcc',
      fontFamily: "'Segoe UI', sans-serif",
      textAlign: 'center',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    },
    quizTitle: {
      fontSize: 'clamp(24px, 5vw, 32px)',
      marginBottom: '15px',
      color: '#00ffff',
      textShadow: '0 0 15px #00ffff, 0 0 25px #00ffff, 0 0 35px #00ffff',
      fontFamily: "'Orbitron', sans-serif",
    },
    quizQuestion: {
      fontSize: 'clamp(18px, 4vw, 22px)',
      marginBottom: '15px',
      textShadow: '0 0 5px #fff',
    },
    quizOptions: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '8px',
      marginBottom: '15px',
    },
    quizLabel: {
      fontSize: 'clamp(16px, 3.5vw, 20px)',
      color: '#fff',
      textShadow: '0 0 5px #00ffcc',
    },
    radioInput: {
      marginRight: '10px',
    },
    button: {
      padding: 'clamp(10px, 2vw, 15px) clamp(20px, 4vw, 30px)',
      backgroundColor: '#00ffff',
      border: 'none',
      color: '#000',
      fontWeight: 'bold',
      borderRadius: '10px',
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.3s ease',
      marginTop: '15px',
      fontSize: 'clamp(1.2rem, 3vw, 1.4rem)',
      fontFamily: "'Orbitron', sans-serif",
      textShadow: '0 0 15px #000, 0 0 25px #000',
      boxShadow: '0 0 20px #00ffcc, 0 0 30px #00ffcc',
      minWidth: 'clamp(150px, 30vw, 200px)',
      transform: 'scale(1)',
    },
    buttonDisabled: {
      backgroundColor: '#666',
      cursor: 'not-allowed',
      boxShadow: '0 0 5px #666',
      transform: 'scale(0.95)',
    },
    score: {
      fontSize: 'clamp(18px, 4vw, 22px)',
      fontWeight: 'bold',
      color: '#00ff99',
      marginTop: '10px',
      textShadow: '0 0 10px #00ff99, 0 0 20px #00ff99',
    },
    stars: {
      fontSize: 'clamp(20px, 5vw, 28px)',
      marginTop: '10px',
      textShadow: '0 0 10px #fff',
    },
    emojiFeedback: {
      fontSize: 'clamp(16px, 3.5vw, 20px)',
      marginTop: '10px',
      color: '#ffc107',
      textShadow: '0 0 10px #ffc107, 0 0 20px #ffc107',
    },
    buttonContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 'clamp(10px, 2vw, 15px)',
      marginTop: '20px',
      padding: '10px',
      width: '100%',
    },
    retryButton: {
      background: '#ff4081',
      color: 'white',
      padding: 'clamp(10px, 2vw, 15px) clamp(20px, 4vw, 30px)',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: 'clamp(1.2rem, 3vw, 1.4rem)',
      fontFamily: "'Orbitron', sans-serif",
      textShadow: '0 0 15px #000, 0 0 25px #000',
      boxShadow: '0 0 20px #ff4081, 0 0 30px #ff4081',
      transition: 'transform 0.2s ease, box-shadow 0.3s ease',
      minWidth: 'clamp(120px, 25vw, 180px)',
      transform: 'scale(1)',
    },
    backButton: {
      background: '#00ffcc',
      color: '#000',
      padding: 'clamp(10px, 2vw, 15px) clamp(20px, 4vw, 30px)',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: 'clamp(1.2rem, 3vw, 1.4rem)',
      fontFamily: "'Orbitron', sans-serif",
      textShadow: '0 0 15px #000, 0 0 25px #000',
      boxShadow: '0 0 20px #00ffcc, 0 0 30px #00ffcc',
      transition: 'transform 0.2s ease, box-shadow 0.3s ease',
      minWidth: 'clamp(120px, 25vw, 180px)',
      transform: 'scale(1)',
    },
    nextLevelButton: {
      background: '#ffeb3b',
      color: '#000',
      padding: 'clamp(10px, 2vw, 15px) clamp(20px, 4vw, 30px)',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: 'clamp(1.2rem, 3vw, 1.4rem)',
      fontFamily: "'Orbitron', sans-serif",
      textShadow: '0 0 15px #000, 0 0 25px #000',
      boxShadow: '0 0 20px #ffeb3b, 0 0 30px #ffeb3b',
      transition: 'transform 0.2s ease, box-shadow 0.3s ease',
      minWidth: 'clamp(120px, 25vw, 180px)',
      transform: 'scale(1)',
    },
    answerReveal: {
      textAlign: 'center',
      width: '100%',
    },
    answerRevealH2: {
      fontSize: 'clamp(20px, 4.5vw, 28px)',
      color: '#fff',
      textShadow: '0 0 15px #ff00ff, 0 0 25px #ff00ff, 0 0 35px #ff00ff',
      fontFamily: "'Orbitron', sans-serif",
    },
    outroText: {
      fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
      margin: '10px 0',
      color: '#fff',
      textShadow: '0 0 10px #00ffcc, 0 0 20px #00ffcc',
    },
    introText: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      fontSize: 'clamp(20px, 5vw, 28px)',
      color: '#ffcc00',
      textShadow: '0 0 15px #ffcc00, 0 0 25px #ffcc00, 0 0 35px #ff00cc',
      whiteSpace: 'pre-wrap',
      width: 'clamp(80%, 90vw, 90%)',
      textAlign: 'center',
      marginTop: '10px'
    },
    pauseButton: {
      position: 'fixed',
      top: 'clamp(10px, 2vw, 20px)',
      right: 'clamp(10px, 2vw, 20px)',
      padding: 'clamp(0.6rem, 1.5vw, 1rem) clamp(1.2rem, 2.5vw, 2rem)',
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
      gap: 'clamp(0.5rem, 1.5vw, 1rem)',
      maxWidth: 'clamp(250px, 80vw, 500px)',
      width: '90%',
      zIndex: 2000,
    },
    popupButton: {
      padding: 'clamp(0.6rem, 1.5vw, 1rem) clamp(1.2rem, 2.5vw, 2rem)',
      fontSize: 'clamp(0.9rem, 2vw, 1.2rem)',
      background: 'linear-gradient(to right, #00ff99, #00ccff)',
      border: 'none',
      borderRadius: '10px',
      color: '#000',
      fontWeight: 'bold',
      cursor: 'pointer',
      boxShadow: '0 0 15px #00ff99, 0 0 30px #00ccff',
      transition: 'transform 0.3s, box-shadow 0.3s',
      minWidth: 'clamp(120px, 25vw, 180px)',
    },
    backdrop: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
    },
  };

  return (
    <div style={styles.app}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700&display=swap');
          @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
          @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
          @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
          @keyframes wiggle { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(2deg); } }
          @keyframes typing { from { width: 0; } to { width: 100%; } }
          @keyframes blink { 50% { border-color: transparent; } }
          @media (max-width: 768px) {
            .introTitle { font-size: clamp(1.5rem, 4vw, 2.5rem); }
            .introText { font-size: clamp(1rem, 2.5vw, 1.5rem); }
            .introButton { padding: clamp(0.6rem, 1.5vw, 1rem) clamp(1.2rem, 2.5vw, 2rem); font-size: clamp(1rem, 2.5vw, 1.3rem); min-width: clamp(150px, 35vw, 250px); }
            .gameHeader { margin-top: 5px; }
            .wizardCauldronContainer { gap: clamp(5px, 1.5vw, 10px); }
            .wizard { width: clamp(80px, 20vw, 140px); }
            .cauldron { width: clamp(50px, 15vw, 90px); }
            .h2 { font-size: clamp(1.2rem, 3.5vw, 2rem); }
            .scoreTimer { font-size: clamp(14px, 3vw, 20px); width: 95%; }
            .ingredients { 
              flex-direction: column; 
              flex-wrap: nowrap; 
              overflow-x: hidden; 
              overflow-y: auto; 
              gap: clamp(8px, 2vw, 12px); 
              padding: clamp(5px, 1.5vw, 10px); 
              max-height: 50vh; 
              align-items: center;
            }
            .card { 
              padding: clamp(8px, 2vw, 15px); 
              min-width: clamp(80px, 60vw, 200px); 
              max-width: 80%; 
              width: 100%;
            }
            .cardImg { width: clamp(40px, 15vw, 60px); height: clamp(40px, 15vw, 60px); }
            .cardText { font-size: clamp(12px, 3vw, 16px); }
            .quizTitle { font-size: clamp(20px, 5vw, 30px); }
            .quizQuestion { font-size: clamp(16px, 4vw, 20px); }
            .quizLabel { font-size: clamp(14px, 3.5vw, 18px); }
            .button { padding: clamp(8px, 2vw, 12px) clamp(16px, 4vw, 24px); font-size: clamp(1rem, 3vw, 1.4rem); min-width: clamp(120px, 25vw, 180px); }
            .retryButton, .backButton, .nextLevelButton { padding: clamp(8px, 2vw, 12px) clamp(16px, 4vw, 24px); font-size: clamp(1rem, 3vw, 1.4rem); min-width: clamp(100px, 20vw, 150px); }
            .answerRevealH2 { font-size: clamp(18px, 4.5vw, 26px); }
            .outroText { font-size: clamp(0.9rem, 2.5vw, 1.2rem); }
            .introText { font-size: clamp(16px, 4vw, 24px); width: 90%; }
            .pauseButton { top: clamp(5px, 1.5vw, 10px); right: clamp(5px, 1.5vw, 10px); padding: clamp(0.5rem, 1.2vw, 0.8rem) clamp(1rem, 2vw, 1.5rem); }
            .popup { padding: clamp(0.8rem, 1.5vw, 1.5rem); max-width: clamp(200px, 80vw, 400px); }
            .popupButton { padding: clamp(0.5rem, 1.2vw, 0.8rem) clamp(1rem, 2vw, 1.5rem); font-size: clamp(0.8rem, 2vw, 1.1rem); min-width: clamp(100px, 20vw, 150px); }
          }
          @media (max-width: 480px) {
            .introTitle { font-size: clamp(1.2rem, 3.5vw, 2rem); }
            .introText { font-size: clamp(0.9rem, 2vw, 1.2rem); }
            .introButton { padding: clamp(0.5rem, 1.2vw, 0.8rem) clamp(1rem, 2vw, 1.6rem); font-size: clamp(0.9rem, 2vw, 1.1rem); min-width: clamp(120px, 30vw, 200px); }
            .wizard { width: clamp(60px, 20vw, 120px); }
            .cauldron { width: clamp(40px, 15vw, 80px); }
            .h2 { font-size: clamp(1rem, 3vw, 1.8rem); }
            .scoreTimer { font-size: clamp(12px, 2.5vw, 18px); }
            .card { padding: clamp(6px, 1.5vw, 10px); min-width: clamp(70px, 60vw, 180px); max-width: 85%; }
            .cardImg { width: clamp(30px, 15vw, 50px); height: clamp(30px, 15vw, 50px); }
            .cardText { font-size: clamp(10px, 2.5vw, 14px); }
            .quizTitle { font-size: clamp(18px, 4.5vw, 28px); }
            .quizQuestion { fontSize: clamp(14px, 3.5vw, 18px); }
            .quizLabel { font-size: clamp(12px, 3vw, 16px); }
            .button { padding: clamp(6px, 1.5vw, 10px) clamp(12px, 3vw, 20px); font-size: clamp(0.9rem, 2.5vw, 1.2rem); }
            .retryButton, .backButton, .nextLevelButton { padding: clamp(6px, 1.5vw, 10px) clamp(12px, 3vw, 20px); font-size: clamp(0.9rem, 2.5vw, 1.2rem); min-width: clamp(80px, 20vw, 120px); }
            .answerRevealH2 { font-size: clamp(16px, 4vw, 24px); }
            .outroText { font-size: clamp(0.8rem, 2vw, 1rem); }
            .introText { font-size: clamp(14px, 3.5vw, 20px); }
            .pauseButton { top: clamp(3px, 1vw, 5px); right: clamp(3px, 1vw, 5px); padding: clamp(0.4rem, 1vw, 0.6rem) clamp(0.8rem, 1.5vw, 1rem); }
            .popup { padding: clamp(0.6rem, 1.2vw, 1rem); max-width: clamp(180px, 80vw, 350px); }
            .popupButton { padding: clamp(0.4rem, 1vw, 0.6rem) clamp(0.8rem, 1.5vw, 1rem); font-size: clamp(0.7rem, 1.8vw, 1rem); min-width: clamp(80px, 20vw, 120px); }
          }
        `}
      </style>
      <audio ref={bgMusicRef} src={wizardAudio} preload="auto" />
      {stage === 'intro' && <Intro onNext={() => nextStage('game')} />}
      {stage === 'game' && (
        <Game
          onNext={(score) => nextStage('outro', score)}
          onRestart={() => {
            setScore(0);
            setPaused(false);
            setIntroText('');
            setIntroDone(false);
            setStage('intro');
          }}
        />
      )}
      {stage === 'outro' && <Outro onNext={() => nextStage('quiz')} />}
      {stage === 'quiz' && <Quiz />}
    </div>
  );
};

export default LearningGame;
