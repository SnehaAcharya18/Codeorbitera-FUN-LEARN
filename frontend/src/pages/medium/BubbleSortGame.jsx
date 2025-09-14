import React, { useState, useEffect, useRef } from 'react';
import backMusic from '../../assets/sounds/midlevel1/back.mp3';
import bubbleSound from '../../assets/sounds/midlevel1/bubble.mp3';
import axios from "axios";

function BubbleSortGame() {
  // Game states
  const [array, setArray] = useState([5, 2, 8, 1, 4]);
  const [score, setScore] = useState(0);
  const [iteration, setIteration] = useState(0);
  const [index, setIndex] = useState(0);
  const [isSwapping, setIsSwapping] = useState(false);
  const [highlightedPair, setHighlightedPair] = useState([-1, -1]);
  const [isSorted, setIsSorted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Quiz states
  const [quizScore, setQuizScore] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState(Array(2).fill(""));

  // Navigation state
  const [currentScreen, setCurrentScreen] = useState('intro');
  const [gameScore, setGameScore] = useState(0);

  // Audio refs
  const backgroundRef = useRef(null);
  const bubbleRef = useRef(null);
  const outroAudioRef = useRef(null);

  const questions = [
    {
      q: "What is the worst-case time complexity of Bubble Sort?",
      options: ["O(n)", "O(log n)", "O(n^2)", "O(n log n)"],
      correct: "O(n^2)",
    },
    {
      q: "Bubble sort is:",
      options: ["Stable", "Unstable", "Recursive", "Non-comparable"],
      correct: "Stable",
    }
  ];

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
    if (currentScreen === 'result') {
      const total = gameScore + quizScore;
      postScore("Level 6", total);
    }
  }, [currentScreen]);

  // Audio setup for Game
  useEffect(() => {
    if (currentScreen === 'game') {
      backgroundRef.current = new Audio(backMusic);
      backgroundRef.current.loop = true;
      backgroundRef.current.volume = 0.5;
      backgroundRef.current.play().catch(() => console.warn("Autoplay failed"));

      bubbleRef.current = new Audio(bubbleSound);

      return () => {
        if (backgroundRef.current) {
          backgroundRef.current.pause();
          backgroundRef.current.currentTime = 0;
        }
      };
    }
  }, [currentScreen]);

  // Audio setup for Outro
  useEffect(() => {
    if (currentScreen === 'outro') {
      outroAudioRef.current = new Audio(backMusic);
      outroAudioRef.current.loop = true;
      outroAudioRef.current.volume = 0.4;
      outroAudioRef.current.play().catch(() => console.warn("Autoplay failed"));

      return () => {
        if (outroAudioRef.current) {
          outroAudioRef.current.pause();
          outroAudioRef.current.currentTime = 0;
        }
      };
    }
  }, [currentScreen]);

  const playClickSound = () => {
    if (bubbleRef.current) {
      bubbleRef.current.currentTime = 0;
      bubbleRef.current.play();
    }
  };

  // Check if the array is sorted
  const checkIfSorted = (arr) => {
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] > arr[i + 1]) {
        return false;
      }
    }
    return true;
  };

  const handleSwap = (i) => {
    if (isSorted || isSwapping || isPaused) return;
    playClickSound();

    setIsSwapping(true);
    setHighlightedPair([i, i + 1]);

    setTimeout(() => {
      const newArr = [...array];
      let swapped = false;

      if (newArr[i] > newArr[i + 1]) {
        [newArr[i], newArr[i + 1]] = [newArr[i + 1], newArr[i]];
        setScore((prev) => prev + 10);
        swapped = true;
      }
      setArray(newArr);

      if (checkIfSorted(newArr)) {
        setIsSorted(true);
        setHighlightedPair([-1, -1]);
        setIsSwapping(false);
        return;
      }

      if (i + 1 >= newArr.length - 1 - iteration) {
        setIteration((prev) => prev + 1);
        setIndex(0);
        setHighlightedPair([-1, -1]);
      } else {
        setIndex(i + 1);
        setHighlightedPair([i + 1, i + 2]);
      }

      setIsSwapping(false);
    }, 500);
  };

  const handleQuizSubmit = () => {
    let score = 0;
    answers.forEach((ans, i) => {
      if (ans === questions[i].correct) score += 10;
    });
    setQuizScore(score);
    setSubmitted(true);
  };

  const handlePlayAgain = () => {
    setArray([5, 2, 8, 1, 4]);
    setScore(0);
    setIteration(0);
    setIndex(0);
    setIsSwapping(false);
    setHighlightedPair([-1, -1]);
    setIsSorted(false);
    setQuizScore(0);
    setSubmitted(false);
    setAnswers(Array(2).fill(""));
    setGameScore(0);
    setIsPaused(false);
    setCurrentScreen(null);
    setTimeout(() => setCurrentScreen('game'), 0);
  };

  const renderIntro = () => (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'radial-gradient(circle at top, #1f1f1f 0%, #000 100%)',
        padding: 'clamp(10px, 5vw, 20px)',
        textAlign: 'center',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          backgroundColor: '#1a1a1a',
          border: '2px solid #333',
          borderRadius: '15px',
          padding: 'clamp(20px, 5vw, 40px)',
          textAlign: 'center',
          boxShadow: '0 0 20px rgba(0,255,255,0.2)',
          maxWidth: 'clamp(300px, 90vw, 1200px)',
          animation: 'fadeIn 1s ease-in-out',
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(3rem, 8vw, 4rem)',
            fontWeight: 'bold',
            color: '#00ffff',
            marginBottom: 'clamp(10px, 3vw, 20px)',
            textShadow: '0 0 10px #0ff',
          }}
        >
          ⚔️ Bubble Sort Arena
        </h1>
        <p
          style={{
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: 'bold',
            lineHeight: '1.6',
            marginBottom: 'clamp(15px, 4vw, 30px)',
          }}
        >
          Welcome to the <span style={{ color: '#00ffff', fontWeight: 'bold' }}>Bubble Sort Game</span>!<br />
          Your mission is to <span style={{ color: '#f1c40f', fontWeight: 'bold' }}>sort the numbers</span> using the Bubble Sort technique.<br />
          Earn <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>+10 points</span> for every correct swap.<br />
          Can you become the ultimate sorting master?
        </p>
        <button
          onClick={() => setCurrentScreen('game')}
          style={{
            backgroundColor: '#00bcd4',
            color: '#fff',
            border: 'none',
            padding: 'clamp(8px, 3vw, 12px) clamp(16px, 4vw, 24px)',
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            borderRadius: '30px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 0 10px #00bcd4, 0 0 20px #00bcd4',
            margin: '5px',
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0097a7'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#00bcd4'}
        >
          ▶ Start Game
        </button>
      </div>
      <footer
        style={{
          marginTop: 'clamp(15px, 4vw, 30px)',
          fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
          color: '#aaa',
        }}
      >
        Fun!!
      </footer>
    </div>
  );

  const renderGame = () => (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#0f0f1a',
        color: '#f0f0f0',
        padding: 'clamp(1rem, 5vw, 3rem)',
        fontFamily: "'Orbitron', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        textAlign: 'center',
        boxSizing: 'border-box',
      }}
    >
      <button
        onClick={() => setIsPaused(true)}
        style={{
          position: 'absolute',
          top: 'clamp(0.5rem, 2vw, 1rem)',
          right: 'clamp(3rem, 6vw, 6rem)',
          padding: 'clamp(0.4rem, 1.5vw, 0.5rem) clamp(0.8rem, 2vw, 1rem)',
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          borderRadius: '8px',
          backgroundColor: '#29293d',
          color: '#ffeb3b',
          border: '1px solid #ffeb3b',
          cursor: 'pointer',
          boxShadow: '0 0 8px #ffeb3b',
          margin: '5px',
          zIndex: 10,
          transition: 'all 0.3s',
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#343456'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#29293d'}
      >
        ⏸ Pause
      </button>
      <h2
        style={{
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          marginBottom: 'clamp(0.5rem, 2vw, 1rem)',
          color: '#00ffd5',
          textShadow: '0 0 8px #00ffd5',
        }}
      >
        Bubble Sort Game
      </h2>
      <p style={{ margin: 'clamp(0.3rem, 1vw, 0.5rem) 0', fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
        Iteration: {iteration + 1}
      </p>
      <div
        style={{
          backgroundColor: '#1e1e2f',
          padding: 'clamp(0.8rem, 2vw, 1rem)',
          borderRadius: '10px',
          margin: 'clamp(0.5rem, 2vw, 1rem) 0',
          boxShadow: '0 0 8px #4fc3f7',
          maxWidth: 'clamp(300px, 90vw, 600px)',
        }}
      >
        <h3
          style={{
            marginBottom: 'clamp(0.3rem, 1vw, 0.5rem)',
            color: '#4fc3f7',
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          }}
        >
          How to Play:
        </h3>
        <p style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
          Compare adjacent numbers. If the left number is greater than the right, click "Swap" to switch them.<br />
          Sort the array inанных order to win!
        </p>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 'clamp(0.5rem, 2vw, 1rem)',
          margin: 'clamp(1rem, 3vw, 2rem) 0',
          flexWrap: 'wrap',
        }}
      >
        {array.map((num, idx) => (
          <span
            key={idx}
            style={{
              background: highlightedPair.includes(idx) ? '#ffeb3b' : '#1c1c2e',
              color: highlightedPair.includes(idx) ? '#000' : '#f0f0f0',
              padding: 'clamp(0.8rem, 2vw, 1rem)',
              borderRadius: '10px',
              boxShadow: '0 0 10px #4fc3f7',
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              position: 'relative',
              transition: 'transform 0.2s, background 0.3s, color 0.3s',
              minWidth: 'clamp(60px, 15vw, 80px)',
              textAlign: 'center',
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            {num}
            {idx < array.length  && !isSorted && (
              <button
                onClick={() => handleSwap(idx)}
                disabled={isSwapping}
                style={{
                  display: 'block',
                  marginTop: 'clamp(0.3rem, 1vw, 0.5rem)',
                  padding: 'clamp(0.3rem, 1vw, 0.4rem) clamp(0.6rem, 1.5vw, 0.8rem)',
                  border: 'none',
                  borderRadius: '5px',
                  backgroundColor: isSwapping ? '#888' : '#00ffd5',
                  color: isSwapping ? '#ccc' : '#000',
                  fontWeight: 'bold',
                  cursor: isSwapping ? 'not-allowed' : 'pointer',
                  boxShadow: isSwapping ? 'none' : '0 0 6px #00ffd5',
                  fontSize: 'clamp(1rem, 3vw, 1.5rem)',
                  width: '100%',
                }}
                onMouseOver={(e) => !isSwapping && (e.target.style.backgroundColor = '#00e1bb')}
                onMouseOut={(e) => !isSwapping && (e.target.style.backgroundColor = '#00ffd5')}
              >
                Swap
              </button>
            )}
          </span>
        ))}
      </div>
      <h3 style={{ margin: 'clamp(0.3rem, 1vw, 0.5rem) 0', fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
        Score: {score}
      </h3>
      {isSorted && (
        <button
          onClick={() => {
            playClickSound();
            setGameScore(score);
            setCurrentScreen('outro');
          }}
          style={{
            marginTop: 'clamp(0.8rem, 2vw, 1.5rem)',
            padding: 'clamp(0.5rem, 1.5vw, 0.8rem) clamp(1rem, 3vw, 1.5rem)',
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            borderRadius: '8px',
            backgroundColor: '#ff4081',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 0 10px #ff4081',
            transition: 'all 0.3s',
            margin: '5px',
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#e91e63'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#ff4081'}
        >
          Next
        </button>
      )}
      {isPaused && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
            color: '#fff',
          }}
        >
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: 'clamp(1rem, 3vw, 2rem)' }}>
            ⏸ Game Paused
          </h2>
          <button
            onClick={() => setIsPaused(false)}
            style={{
              padding: 'clamp(0.5rem, 2vw, 1rem) clamp(1rem, 3vw, 2rem)',
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              borderRadius: '8px',
              backgroundColor: '#00ffd5',
              color: '#000',
              margin: 'clamp(5px, 2vw, 10px)',
              cursor: 'pointer',
              border: 'none',
              boxShadow: '0 0 10px #00ffd5',
              transition: 'all 0.3s',
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#00e1bb'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#00ffd5'}
          >
            ▶ Resume
          </button>
          <button
            onClick={handlePlayAgain}
            style={{
              padding: 'clamp(0.5rem, 2vw, 1rem) clamp(1rem, 3vw, 2rem)',
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              borderRadius: '8px',
              backgroundColor: '#ff9800',
              color: '#000',
              margin: 'clamp(5px, 2vw, 10px)',
              cursor: 'pointer',
              border: 'none',
              boxShadow: '0 0 10px #ff9800',
              transition: 'all 0.3s',
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#f57c00'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ff9800'}
          >
            🔁 Restart
          </button>
          <button
            onClick={() => window.location.href = '/dashboard'}
            style={{
              padding: 'clamp(0.5rem, 2vw, 1rem) clamp(1rem, 3vw, 2rem)',
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              borderRadius: '8px',
              backgroundColor: '#f44336',
              color: '#fff',
              margin: 'clamp(5px, 2vw, 10px)',
              cursor: 'pointer',
              border: 'none',
              boxShadow: '0 0 10px #f44336',
              transition: 'all 0.3s',
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#d32f2f'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#f44336'}
          >
            🏠 Dashboard
          </button>
        </div>
      )}
    </div>
  );

  const renderOutro = () => (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#0f0f1a',
        color: '#f0f0f0',
        padding: 'clamp(1rem, 5vw, 2rem)',
        fontFamily: "'Orbitron', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        boxSizing: 'border-box',
      }}
    >
      <audio ref={outroAudioRef} src={backMusic} loop />
      <h2
        style={{
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          color: '#00ffd5',
          textShadow: '0 0 8px #00ffd5',
          marginBottom: 'clamp(0.5rem, 2vw, 1rem)',
        }}
      >
        🎉 Great Job! 🎉
      </h2>
      <p style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
        You just played with the <strong>Bubble Sort</strong> algorithm!
      </p>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 'clamp(0.5rem, 2vw, 1rem)',
          margin: 'clamp(0.5rem, 2vw, 1rem) 0',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            backgroundColor: '#1e1e2f',
            padding: 'clamp(0.8rem, 2vw, 1rem) clamp(1rem, 3vw, 1.5rem)',
            borderRadius: '12px',
            boxShadow: '0 0 8px #4fc3f7',
            maxWidth: 'clamp(300px, 45vw, 900px)',
            flex: 1,
          }}
        >
          <h3
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              marginBottom: 'clamp(0.3rem, 1vw, 0.5rem)',
              color: '#4fc3f7',
            }}
          >
            🔍 How Bubble Sort Works:
          </h3>
          <ol
            style={{
              paddingLeft: 'clamp(1rem, 3vw, 1.5rem)',
              textAlign: 'left',
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            }}
          >
            <li>Compare adjacent elements.</li>
            <li>If the left is greater than the right → <strong>Swap them</strong>.</li>
            <li>Repeat for all elements → Largest “bubbles” to the end!</li>
            <li>Do this for multiple passes until the array is sorted.</li>
          </ol>
        </div>
        <div
          style={{
            backgroundColor: '#111122',
            padding: 'clamp(0.8rem, 2vw, 1rem) clamp(1rem, 3vw, 1.5rem)',
            borderRadius: '10px',
            boxShadow: '0 0 10px #ff4081',
            maxWidth: 'clamp(300px, 45vw, 900px)',
            flex: 1,
          }}
        >
          <h4
            style={{
              color: '#ff4081',
              marginBottom: 'clamp(0.3rem, 1vw, 0.5rem)',
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            }}
          >
            🧠 Example Pass:
          </h4>
          <p style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
            <code>[5, <span style={{ color: '#ffeb3b' }}>2</span>, <span style={{ color: '#ffeb3b' }}>8</span>, 1, 4]</code> → Compare 2 & 8, No Swap
          </p>
          <p style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
            <code>[5, 2, <span style={{ color: '#ffeb3b' }}>8</span>, <span style={{ color: '#ffeb3b' }}>1</span>, 4]</code> → Swap → <code>[5, 2, 1, 8, 4]</code>
          </p>
          <p style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
            <code>[5, 2, 1, <span style={{ color: '#ffeb3b' }}>8</span>, <span style={{ color: '#ffeb3b' }}>4</span>]</code> → Swap → <code>[5, 2, 1, 4, 8]</code>
          </p>
          <p style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
            ✨ Largest number <strong>“bubbled”</strong> to the end!
          </p>
        </div>
      </div>
      <button
        onClick={() => setCurrentScreen('quiz')}
        style={{
          marginTop: 'clamp(0.5rem, 2vw, 1rem)',
          padding: 'clamp(0.5rem, 1.5vw, 0.8rem) clamp(1rem, 3vw, 1.5rem)',
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          borderRadius: '8px',
          backgroundColor: '#ff4081',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 0 10px #ff4081',
          transition: 'all 0.3s',
          margin: '5px',
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#e91e63'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#ff4081'}
      >
        Take Quiz
      </button>
    </div>
  );

  const renderQuiz = () => (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#0f0f1a',
        color: '#f0f0f0',
        padding: 'clamp(1rem, 5vw, 2rem)',
        fontFamily: "'Orbitron', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        boxSizing: 'border-box',
      }}
    >
      <h2
        style={{
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          color: '#00ffd5',
          textShadow: '0 0 8px #00ffd5',
          marginBottom: 'clamp(1rem, 3vw, 2rem)',
        }}
      >
        🧪 Bubble Sort Quiz
      </h2>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 'clamp(0.5rem, 2vw, 1rem)',
          marginBottom: 'clamp(1rem, 3vw, 1.5rem)',
          flexWrap: 'wrap',
          justifyContent: 'center',
          width: '100%',
          maxWidth: 'clamp(300px, 90vw, 900px)',
        }}
      >
        {questions.map((q, i) => (
          <div
            key={i}
            style={{
              backgroundColor: '#1c1c2b',
              padding: 'clamp(0.8rem, 2vw, 1rem)',
              borderRadius: '10px',
              boxShadow: '0 0 8px #4fc3f7',
              width: '100%',
              flex: 1,
            }}
          >
            <p
              style={{
                marginBottom: 'clamp(0.3rem, 1vw, 0.5rem)',
                fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                fontWeight: 'bold',
                color: '#ffffff',
              }}
            >
              {i + 1}. {q.q}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {q.options.map((opt) => {
                const isSelected = answers[i] === opt;
                const isCorrect = submitted && opt === q.correct;
                const isWrong = submitted && isSelected && opt !== q.correct;

                return (
                  <label
                    key={opt}
                    style={{
                      padding: 'clamp(0.4rem, 1.5vw, 0.5rem) clamp(0.8rem, 2vw, 1rem)',
                      fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                      margin: 'clamp(0.2rem, 0.5vw, 0.3rem) 0',
                      borderRadius: '6px',
                      backgroundColor: isCorrect ? '#2e7d32' : isWrong ? '#c62828' : '#29293d',
                      cursor: submitted ? 'default' : 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      color: isCorrect || isWrong ? '#ffffff' : '#f0f0f0',
                    }}
                    onMouseOver={(e) => !isCorrect && !isWrong && !submitted && (e.target.style.backgroundColor = '#343456')}
                    onMouseOut={(e) => !isCorrect && !isWrong && !submitted && (e.target.style.backgroundColor = '#29293d')}
                  >
                    <input
                      type="radio"
                      name={`q${i}`}
                      value={opt}
                      disabled={submitted}
                      checked={answers[i] === opt}
                      onChange={() => {
                        const newAns = [...answers];
                        newAns[i] = opt;
                        setAnswers(newAns);
                      }}
                      style={{
                        marginRight: 'clamp(0.3rem, 1vw, 0.5rem)',
                        width: 'clamp(16px, 4vw, 20px)',
                        height: 'clamp(16px, 4vw, 20px)',
                      }}
                    />
                    {opt}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {!submitted ? (
        <button
          onClick={handleQuizSubmit}
          style={{
            marginTop: 'clamp(0.5rem, 2vw, 1rem)',
            padding: 'clamp(0.5rem, 1.5vw, 0.8rem) clamp(1rem, 3vw, 1.5rem)',
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            borderRadius: '8px',
            backgroundColor: '#ff4081',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 0 10px #ff4081',
            transition: 'all 0.3s',
            margin: '5px',
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#e91e63'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#ff4081'}
        >
          Submit Quiz
        </button>
      ) : (
        <button
          onClick={() => setCurrentScreen('result')}
          style={{
            marginTop: 'clamp(0.5rem, 2vw, 1rem)',
            padding: 'clamp(0.5rem, 1.5vw, 0.8rem) clamp(1rem, 3vw, 1.5rem)',
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            borderRadius: '8px',
            backgroundColor: '#ff4081',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 0 10px #ff4081',
            transition: 'all 0.3s',
            margin: '5px',
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#e91e63'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#ff4081'}
        >
          See Results
        </button>
      )}
    </div>
  );

  const renderResult = () => {
    const total = gameScore + quizScore;
    const getStars = () => {
      if (total >= 30) return "⭐⭐⭐";
      if (total >= 20) return "⭐⭐";
      if (total >= 10) return "⭐";
      return "No stars";
    };

    return (
      <div
        style={{
          width: '100%',
          minHeight: '100vh',
          backgroundColor: '#0d0d1a',
          color: '#e0e0e0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Orbitron', sans-serif",
          padding: 'clamp(1rem, 5vw, 2rem)',
          textAlign: 'center',
          boxSizing: 'border-box',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            color: '#00ffd5',
            textShadow: '0 0 10px #00ffd5',
            marginBottom: 'clamp(0.8rem, 2vw, 1.5rem)',
          }}
        >
          🎉 Final Score: {total}
        </h2>
        <p style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', margin: 'clamp(0.3rem, 1vw, 0.5rem) 0' }}>
          🕹️ Game Score: {gameScore}
        </p>
        <p style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', margin: 'clamp(0.3rem, 1vw, 0.5rem) 0' }}>
          🧠 Quiz Score: {quizScore}
        </p>
        <div
          style={{
            margin: 'clamp(1rem, 3vw, 2rem) 0',
            padding: 'clamp(0.8rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
            background: 'linear-gradient(to right, #0d47a1, #1976d2)',
            borderRadius: '15px',
            boxShadow: '0 0 15px #42a5f5',
          }}
        >
          <h3
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              color: '#ffffff',
              marginBottom: 'clamp(0.3rem, 1vw, 0.5rem)',
            }}
          >
            🌟 Your Rating
          </h3>
          <div
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              color: '#fffde7',
              textShadow: '0 0 10px #ffee58',
            }}
          >
            {getStars()}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 'clamp(0.5rem, 2vw, 1rem)',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={() => window.location.href = '/dashboard'}
            style={{
              padding: 'clamp(0.5rem, 1.5vw, 0.8rem) clamp(1rem, 3vw, 2rem)',
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              marginTop: 'clamp(0.8rem, 2vw, 1.5rem)',
              borderRadius: '8px',
              backgroundColor: '#00bcd4',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 0 10px #00bcd4',
              transition: 'all 0.3s',
              margin: '5px',
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0097a7'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#00bcd4'}
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => window.location.href = '/MazeGame'}
            style={{
              padding: 'clamp(0.5rem, 1.5vw, 0.8rem) clamp(1rem, 3vw, 2rem)',
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              marginTop: 'clamp(0.8rem, 2vw, 1.5rem)',
              borderRadius: '8px',
              backgroundColor: '#ff4081',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 0 10px #ff4081',
              transition: 'all 0.3s',
              margin: '5px',
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#e91e63'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ff4081'}
          >
            Next Level
          </button>
          <button
            className="play-again"
            onClick={handlePlayAgain}
            style={{
              padding: 'clamp(0.5rem, 1.5vw, 0.8rem) clamp(1rem, 3vw, 2rem)',
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              marginTop: 'clamp(0.8rem, 2vw, 1.5rem)',
              borderRadius: '8px',
              backgroundColor: '#4fc3f7',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 0 10px #4fc3f7',
              transition: 'all 0.3s',
              margin: '5px',
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#42a5f5'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#4fc3f7'}
          >
            🔁 Play Again
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        overflow: 'auto',
      }}
    >
      {currentScreen === 'intro' && renderIntro()}
      {currentScreen === 'game' && renderGame()}
      {currentScreen === 'outro' && renderOutro()}
      {currentScreen === 'quiz' && renderQuiz()}
      {currentScreen === 'result' && renderResult()}
    </div>
  );
}

export default BubbleSortGame;