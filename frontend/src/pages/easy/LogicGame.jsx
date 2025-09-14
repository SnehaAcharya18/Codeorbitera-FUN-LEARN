
import React, { useState, useEffect, useRef } from 'react';

// Import audio files
import backgroundMusic from '../../assets/sounds/level4/background.mp3';
import clickSound from '../../assets/sounds/level4/click.mp3';
import openSound from '../../assets/sounds/level4/open.mp3';
import correctSound from '../../assets/sounds/level4/correct.mp3';
import wrongSound from '../../assets/sounds/level4/wrong.wav';
import axios from "axios";

// Import image files
import doorBlueClosed from '../../assets/images/level4/door-blue-closed.png';
import doorBlueOpen from '../../assets/images/level4/door-blue-open.png';
import doorRedClosed from '../../assets/images/level4/door-red-closed.png';
import doorRedOpen from '../../assets/images/level4/door-red-open.png';

const LogicGame = () => {
  const [step, setStep] = useState(0);
  const [gameScore, setGameScore] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [switchOn, setSwitchOn] = useState(false);
  const [openedDoor, setOpenedDoor] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [paused, setPaused] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const bgmRef = useRef(null);

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
    if (step === 3 && answered) {
      postScore("Level 4", totalScore);
    }
  }, [step, answered]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const bgm = new Audio(backgroundMusic);
    bgm.loop = true;
    bgm.volume = 0.4;
    bgmRef.current = bgm;

    return () => {
      bgm.pause();
      bgm.currentTime = 0;
    };
  }, []);

  const playSound = (src) => {
    const audio = new Audio(src);
    audio.play();
  };

  const stopMusic = () => {
    if (bgmRef.current) {
      bgmRef.current.pause();
      bgmRef.current.currentTime = 0;
    }
  };

  const nextStep = () => {
    if (step === 1 && startTime && !paused) {
      setTimeTaken(Math.floor((Date.now() - startTime) / 1000));
    }
    setStep((prev) => prev + 1);
  };

  const restart = () => {
    setStep(0);
    setGameScore(0);
    setQuizScore(0);
    setTimeTaken(0);
    setStartTime(null);
    setSwitchOn(false);
    setOpenedDoor(null);
    setAnswered(false);
    setCorrect(false);
    setPaused(false);
    if (bgmRef.current) bgmRef.current.play().catch(() => {});
  };

  const handleGameStart = () => {
    setStartTime(Date.now());
    if (bgmRef.current && !paused) {
      bgmRef.current.play().catch(() => {});
    }
    nextStep();
  };

  const handleSwitchToggle = () => {
    if (!paused) {
      setSwitchOn(!switchOn);
      playSound(clickSound);
    }
  };

  const handleDoorClick = (color) => {
    if (!paused && !openedDoor) {
      if ((color === 'blue' && switchOn) || (color === 'red' && !switchOn)) {
        setOpenedDoor(color);
        playSound(openSound);
        setGameScore(50);
        setTimeout(nextStep, 1500);
      } else {
        alert('Wrong door! Try again.');
      }
    }
  };

  const handleAnswer = (ans) => {
    if (!paused && !answered) {
      const isCorrect = ans === "Yes";
      setCorrect(isCorrect);
      setAnswered(true);
      setQuizScore(isCorrect ? 50 : 0);
      playSound(isCorrect ? correctSound : wrongSound);
      stopMusic();
    }
  };

  const handleBackToDashboard = () => {
    window.location.href = '/dashboard';
  };

  const handleNextLevel = () => {
    window.location.href = '/BridgeGame';
  };

  const togglePause = () => {
    if (!paused) {
      stopMusic();
      setPaused(true);
    } else {
      setPaused(false);
      if (step === 1 && startTime) bgmRef.current.play().catch(() => {});
    }
  };

  const currentQuizScore = correct ? 50 : 0;
  const totalScore = gameScore + currentQuizScore;
  const stars = totalScore === 100
    ? timeTaken <= 10 ? 3 : timeTaken <= 20 ? 2 : 1
    : totalScore >= 50 ? 1 : 0;

  const getResponsiveValue = (base, tablet, mobile) => {
    if (windowWidth <= 480) return mobile;
    if (windowWidth <= 768) return tablet;
    return base;
  };

  const getContainerStyle = () => ({
    fontFamily: "'Orbitron', sans-serif",
    margin: 0,
    background: '#0a0a0a',
    color: '#e0e0e0',
    textAlign: 'center',
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: getResponsiveValue('1.2rem', '1rem', '0.9rem'),
  });

  const getSectionStyle = (baseColor, borderColor) => ({
    background: `radial-gradient(circle at top, ${baseColor}, #000)`,
    border: `${getResponsiveValue('3px', '2px', '1px')} solid ${borderColor}`,
    padding: getResponsiveValue('2rem', '1.5rem', '1rem'),
    borderRadius: getResponsiveValue('20px', '15px', '10px'),
    boxShadow: `0 0 ${getResponsiveValue('20px', '15px', '10px')} ${borderColor}`,
    width: '90%',
    maxWidth: getResponsiveValue('800px', '600px', '400px'),
  });

  const getHeadingStyle = (color) => ({
    textShadow: '0 0 5px #fff, 0 0 10px currentColor',
    fontSize: getResponsiveValue('2.5rem', '2rem', '1.5rem'),
    color,
  });

  const getParagraphStyle = () => ({
    fontSize: getResponsiveValue('1.4rem', '1.2rem', '1rem'),
  });

  const getButtonStyle = (isHovering = false) => ({
    fontFamily: "'Orbitron', sans-serif",
    margin: getResponsiveValue('1rem', '0.5rem', '0.3rem'),
    padding: getResponsiveValue('14px 28px', '10px 20px', '8px 16px'),
    fontSize: getResponsiveValue('1.3rem', '1.1rem', '1rem'),
    background: 'black',
    color: 'white',
    border: `${getResponsiveValue('2px', '1.5px', '1px')} solid #ff9100`,
    borderRadius: getResponsiveValue('10px', '8px', '6px'),
    boxShadow: `0 0 ${getResponsiveValue('10px', '8px', '5px')} #ff9100, 0 0 ${getResponsiveValue('20px', '15px', '10px')} #ff9100`,
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.3s',
    ...(isHovering && { transform: 'scale(1.1)', boxShadow: `0 0 ${getResponsiveValue('20px', '15px', '10px')} #ff9100, 0 0 ${getResponsiveValue('30px', '25px', '15px')} #ff9100` }),
  });

  const getSwitchButtonStyle = (isHovering = false) => ({
    ...getButtonStyle(isHovering),
    border: `${getResponsiveValue('2px', '1.5px', '1px')} solid #ff1744`,
    boxShadow: `0 0 ${getResponsiveValue('10px', '8px', '5px')} #ff1744, 0 0 ${getResponsiveValue('20px', '15px', '10px')} #ff1744`,
  });

  const getDoorStyle = (color, isOpen, isHovering) => ({
    width: getResponsiveValue('150px', '120px', '100px'),
    height: getResponsiveValue('250px', '200px', '160px'),
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderRadius: getResponsiveValue('12px', '10px', '8px'),
    border: `${getResponsiveValue('3px', '2px', '1px')} solid #fff`,
    cursor: 'pointer',
    transition: 'transform 0.4s ease, box-shadow 0.3s',
    ...(color === 'blue' && {
      backgroundImage: isOpen ? `url(${doorBlueOpen})` : `url(${doorBlueClosed})`,
      boxShadow: isOpen ? `0 0 ${getResponsiveValue('25px', '20px', '15px')} #00bfff` : `0 0 ${getResponsiveValue('12px', '10px', '8px')} #00bfff`,
    }),
    ...(color === 'red' && {
      backgroundImage: isOpen ? `url(${doorRedOpen})` : `url(${doorRedClosed})`,
      boxShadow: isOpen ? `0 0 ${getResponsiveValue('25px', '20px', '15px')} #ff1744` : `0 0 ${getResponsiveValue('12px', '10px', '8px')} #ff1744`,
    }),
    ...(isOpen && { transform: color === 'blue' ? 'rotateY(15deg) scale(1.1)' : 'rotateY(-15deg) scale(1.1)' }),
    ...(isHovering && !isOpen && !paused && { transform: 'scale(1.05)' }),
    pointerEvents: paused ? 'none' : 'auto',
  });

  const getPauseButtonStyle = (isHovering = false) => ({
    position: 'fixed',
    top: getResponsiveValue('1rem', '0.5rem', '0.3rem'),
    right: getResponsiveValue('1rem', '0.5rem', '0.3rem'),
    padding: getResponsiveValue('10px 20px', '8px 16px', '6px 12px'),
    fontSize: getResponsiveValue('1.2rem', '1rem', '0.9rem'),
    background: '#ff4444',
    border: `${getResponsiveValue('2px', '1.5px', '1px')} solid #ff0000`,
    borderRadius: getResponsiveValue('10px', '8px', '6px'),
    boxShadow: `0 0 ${getResponsiveValue('10px', '8px', '5px')} #ff0000`,
    cursor: 'pointer',
    ...(isHovering && { transform: 'scale(1.1)' }),
  });

  const getPausePopupStyle = () => ({
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'rgba(0, 0, 0, 0.9)',
    padding: getResponsiveValue('2rem', '1.5rem', '1rem'),
    borderRadius: getResponsiveValue('20px', '15px', '10px'),
    border: `${getResponsiveValue('3px', '2px', '1px')} solid #ff4444`,
    boxShadow: `0 0 ${getResponsiveValue('20px', '15px', '10px')} #ff4444`,
    zIndex: 1000,
    textAlign: 'center',
  });

  const getBackdropStyle = () => ({
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  });

  return (
    <div style={getContainerStyle()}>
      {paused && <div style={getBackdropStyle()} />}
      {paused && (
        <div style={getPausePopupStyle()}>
          <h2 style={{ ...getHeadingStyle('#ff4444') }}>Game Paused</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: getResponsiveValue('1rem', '0.5rem', '0.3rem'), marginTop: getResponsiveValue('1rem', '0.5rem', '0.3rem'), flexDirection: windowWidth <= 480 ? 'column' : 'row' }}>
            <button
              style={getButtonStyle()}
              onClick={togglePause}
              onMouseEnter={(e) => Object.assign(e.target.style, getButtonStyle(true))}
              onMouseLeave={(e) => Object.assign(e.target.style, getButtonStyle())}
            >
              Resume
            </button>
            <button
              style={getButtonStyle()}
              onClick={restart}
              onMouseEnter={(e) => Object.assign(e.target.style, getButtonStyle(true))}
              onMouseLeave={(e) => Object.assign(e.target.style, getButtonStyle())}
            >
              Restart
            </button>
            <button
              style={getButtonStyle()}
              onClick={handleBackToDashboard}
              onMouseEnter={(e) => Object.assign(e.target.style, getButtonStyle(true))}
              onMouseLeave={(e) => Object.assign(e.target.style, getButtonStyle())}
            >
              Dashboard
            </button>
          </div>
        </div>
      )}
      {step === 0 && (
        <div style={getSectionStyle('#001f3f', '#00bfff')}>
          <h1 style={getHeadingStyle('#00bfff')}>The Color Door Puzzle</h1>
          <p style={getParagraphStyle()}>Use boolean logic to determine which door to open based on the switch state.</p>
          <button
            style={getButtonStyle()}
            onClick={handleGameStart}
            onMouseEnter={(e) => Object.assign(e.target.style, getButtonStyle(true))}
            onMouseLeave={(e) => Object.assign(e.target.style, getButtonStyle())}
            disabled={paused}
          >
            Start Game
          </button>
        </div>
      )}
      {step === 1 && (
        <div style={getSectionStyle('#2b0000', '#ff1744')}>
          <h2 style={getHeadingStyle('#ff1744')}>Boolean Logic Puzzle</h2>
          <p style={getParagraphStyle()}>
            {switchOn
              ? 'If the Switch is ON → Open the BLUE door. Click on switch to off it'
              : 'If the Switch is OFF → Open the RED door. Click on switch to on it'}
          </p>
          <button
            style={getSwitchButtonStyle()}
            onClick={handleSwitchToggle}
            onMouseEnter={(e) => Object.assign(e.target.style, getSwitchButtonStyle(true))}
            onMouseLeave={(e) => Object.assign(e.target.style, getSwitchButtonStyle())}
            disabled={paused}
          >
            Switch: {switchOn ? 'ON' : 'OFF'}
          </button>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: getResponsiveValue('2rem', '1.5rem', '1rem'), gap: getResponsiveValue('2rem', '1.5rem', '1rem'), flexDirection: windowWidth <= 480 ? 'column' : 'row', alignItems: 'center' }}>
            <div
              style={getDoorStyle('blue', openedDoor === 'blue', false)}
              onClick={() => handleDoorClick('blue')}
              onMouseEnter={(e) => Object.assign(e.target.style, getDoorStyle('blue', openedDoor === 'blue', true))}
              onMouseLeave={(e) => Object.assign(e.target.style, getDoorStyle('blue', openedDoor === 'blue', false))}
            />
            <div
              style={getDoorStyle('red', openedDoor === 'red', false)}
              onClick={() => handleDoorClick('red')}
              onMouseEnter={(e) => Object.assign(e.target.style, getDoorStyle('red', openedDoor === 'red', true))}
              onMouseLeave={(e) => Object.assign(e.target.style, getDoorStyle('red', openedDoor === 'red', false))}
            />
          </div>
          <button
            style={getPauseButtonStyle()}
            onClick={togglePause}
            onMouseEnter={(e) => Object.assign(e.target.style, getPauseButtonStyle(true))}
            onMouseLeave={(e) => Object.assign(e.target.style, getPauseButtonStyle())}
          >
            Pause
          </button>
        </div>
      )}
      {step === 2 && (
        <div style={getSectionStyle('#1a0033', '#aa00ff')}>
          <h2 style={getHeadingStyle('#aa00ff')}>Well Done!</h2>
          <p style={getParagraphStyle()}>You just used boolean logic (true/false) to open the correct door. Logical conditions like:</p>
          <ul style={{ fontSize: getResponsiveValue('1.4rem', '1.2rem', '1rem') }}>
            <li><code>if (switch === true)</code> → Blue door</li>
            <li><code>if (switch === false)</code> → Red door</li>
          </ul>
          <button
            style={getButtonStyle()}
            onClick={nextStep}
            onMouseEnter={(e) => Object.assign(e.target.style, getButtonStyle(true))}
            onMouseLeave={(e) => Object.assign(e.target.style, getButtonStyle())}
            disabled={paused}
          >
            Take Quiz
          </button>
          <button
            style={getPauseButtonStyle()}
            onClick={togglePause}
            onMouseEnter={(e) => Object.assign(e.target.style, getPauseButtonStyle(true))}
            onMouseLeave={(e) => Object.assign(e.target.style, getPauseButtonStyle())}
          >
            Pause
          </button>
        </div>
      )}
      {step === 3 && (
        <div style={getSectionStyle('#003300', '#00e676')}>
          <h2 style={getHeadingStyle('#00e676')}>Quiz</h2>
          {!answered ? (
            <>
              <p style={getParagraphStyle()}>If the switch is ON, is the condition 'switch === true' correct?</p>
              <button
                style={getButtonStyle()}
                onClick={() => handleAnswer("Yes")}
                onMouseEnter={(e) => Object.assign(e.target.style, getButtonStyle(true))}
                onMouseLeave={(e) => Object.assign(e.target.style, getButtonStyle())}
                disabled={paused}
              >
                Yes
              </button>
              <button
                style={getButtonStyle()}
                onClick={() => handleAnswer("No")}
                onMouseEnter={(e) => Object.assign(e.target.style, getButtonStyle(true))}
                onMouseLeave={(e) => Object.assign(e.target.style, getButtonStyle())}
                disabled={paused}
              >
                No
              </button>
            </>
          ) : (
            <div style={{
              marginTop: getResponsiveValue('2rem', '1.5rem', '1rem'),
              padding: getResponsiveValue('1rem', '0.8rem', '0.5rem'),
              border: `${getResponsiveValue('2px', '1.5px', '1px')} solid #00e676`,
              borderRadius: getResponsiveValue('8px', '6px', '4px'),
              background: '#001a00',
              color: '#00ffcc',
              boxShadow: `0 0 ${getResponsiveValue('12px', '10px', '8px')} #00e676`,
              fontSize: getResponsiveValue('1.4rem', '1.2rem', '1rem'),
            }}>
              <h3 style={{ fontSize: getResponsiveValue('2rem', '1.5rem', '1.2rem') }}>{correct ? 'Correct!' : 'Incorrect!'}</h3>
              <p>🎯 Final Score: {totalScore}</p>
              <p>⏱ Time Taken: {timeTaken} seconds</p>
              <p>
                ⭐ Star Rating:{' '}
                {[...Array(stars)].map((_, i) => (
                  <span key={i} style={{ color: '#ffea00', fontSize: getResponsiveValue('2rem', '1.5rem', '1.2rem'), textShadow: '0 0 10px #ffea00' }}>★</span>
                ))}
                {[...Array(3 - stars)].map((_, i) => (
                  <span key={i + stars} style={{ color: '#444', fontSize: getResponsiveValue('2rem', '1.5rem', '1.2rem') }}>★</span>
                ))}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: getResponsiveValue('1rem', '0.5rem', '0.3rem'), marginTop: getResponsiveValue('1rem', '0.5rem', '0.3rem'), flexDirection: windowWidth <= 480 ? 'column' : 'row' }}>
                <button
                  style={getButtonStyle()}
                  onClick={handleBackToDashboard}
                  onMouseEnter={(e) => Object.assign(e.target.style, getButtonStyle(true))}
                  onMouseLeave={(e) => Object.assign(e.target.style, getButtonStyle())}
                >
                  Back to Dashboard
                </button>
                <button
                  style={getButtonStyle()}
                  onClick={restart}
                  onMouseEnter={(e) => Object.assign(e.target.style, getButtonStyle(true))}
                  onMouseLeave={(e) => Object.assign(e.target.style, getButtonStyle())}
                >
                  Restart Game
                </button>
                <button
                  style={getButtonStyle()}
                  onClick={handleNextLevel}
                  onMouseEnter={(e) => Object.assign(e.target.style, getButtonStyle(true))}
                  onMouseLeave={(e) => Object.assign(e.target.style, getButtonStyle())}
                >
                  Next Level
                </button>
              </div>
            </div>
          )}
          <button
            style={getPauseButtonStyle()}
            onClick={togglePause}
            onMouseEnter={(e) => Object.assign(e.target.style, getPauseButtonStyle(true))}
            onMouseLeave={(e) => Object.assign(e.target.style, getPauseButtonStyle())}
          >
            Pause
          </button>
        </div>
      )}
    </div>
  );
};

export default LogicGame;