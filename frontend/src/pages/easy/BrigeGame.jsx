import React, { useState, useEffect } from "react";
import backgroundImage from "../../assets/images/level5/oceann.png";
import bridgeImage from "../../assets/images/level5/bridgee.png";
import island1 from "../../assets/images/level5/island.png";
import island2 from "../../assets/images/level5/island2.png";
import island3 from "../../assets/images/level5/island3.png";
import island4 from "../../assets/images/level5/island5.png";
import island5 from "../../assets/images/level5/island6.png";
import island6 from "../../assets/images/level5/island7.png";
import clickSound from "../../assets/sounds/level5/click.wav";
import bridgeSound from "../../assets/sounds/level5/bridge.mp3";
import bgMusic from "../../assets/sounds/level5/bgmusic.mp3";
import axios from "axios";
import { useRef } from "react";



const islandImages = [island1, island2, island3, island4, island5, island6];

const BridgeGame = () => {
  const [stage, setStage] = useState('intro');
    const [isPaused, setIsPaused] = useState(false); // ✅ New state
const restartGame = () => {
  setStage("intro");
  setSelectedIslands([]);
  setBridges([]);
  setQuizScore(0);
  setFeedback("");
  setGameScore(0);
  setParticles([]);
  setIsPaused(false);
};
const musicRef = useRef(null);

// Pause toggle
const togglePause = () => setIsPaused((prev) => !prev);
const [islands] = useState([
  { id: 1, x: "20%", y: "15%", name: "Dawn Isle" },
  { id: 2, x: "80%", y: "20%", name: "Mist Haven" },
  { id: 3, x: "35%", y: "35%", name: "Starfall" },
  { id: 4, x: "65%", y: "40%", name: "Twilight Reef" },
  { id: 5, x: "25%", y: "70%", name: "Coral Crest" },
  { id: 6, x: "85%", y: "75%", name: "Ember Cove" },
]);

  
  const [selectedIslands, setSelectedIslands] = useState([]);
  const [bridges, setBridges] = useState([]);
  const [quizScore, setQuizScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [gameScore, setGameScore] = useState(0);
  const [particles, setParticles] = useState([]);
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
  if (stage === "result") {
    postScore("Level 5", totalScore);
  }
}, [stage]);

  // Play background music
 useEffect(() => {
  const music = new Audio(bgMusic);
  music.loop = true;
  music.volume = 0.3;
  music.play().catch((err) => console.log("Music error:", err));
  musicRef.current = music;

  return () => {
    music.pause();
    musicRef.current = null;
  };
}, []);
useEffect(() => {
  if (!musicRef.current) return;
  if (isPaused) {
    musicRef.current.pause();
  } else {
    musicRef.current.play().catch(() => {});
  }
}, [isPaused]);


  // Particle effect for bridge creation
  const createParticles = (x, y) => {
    const newParticles = Array.from({ length: 10 }, () => ({
      id: Math.random(),
      x,
      y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 1,
    }));
    setParticles((prev) => [...prev, ...newParticles]);

    const interval = setInterval(() => {
        if (isPaused) return; // 🚫 don't update when paused

      setParticles((prev) =>
        prev
          .map((p) => ({ ...p, life: p.life - 0.04 }))
          .filter((p) => p.life > 0)
      );
    }, 50);
    setTimeout(() => clearInterval(interval), 1500);
  };

  const playSound = (sound) => {
    const audio = new Audio(sound);
    audio.play().catch((err) => console.log('Audio error:', err));
  };

  const handleIslandClick = (id) => {
    if (isPaused) return; // stop clicks when paused

    playSound(clickSound);
    if (selectedIslands.length === 0) {
      setSelectedIslands([id]);
    } else if (selectedIslands.length === 1) {
      const from = selectedIslands[0];
      const to = id;
      const alreadyConnected = bridges.some(
        (b) => (b.from === from && b.to === to) || (b.from === to && b.to === from)
      );
      if (from !== to && !alreadyConnected) {
        setBridges([...bridges, { from, to }]);
        setGameScore((prev) => prev + 5);
        playSound(bridgeSound);
        const fromIsland = islands.find((i) => i.id === from);
        const toIsland = islands.find((i) => i.id === to);
        const midX = (fromIsland.x + toIsland.x) / 2;
        const midY = (fromIsland.y + toIsland.y) / 2;
        createParticles(midX, midY);
      }
      setSelectedIslands([]);
    }
  };

  const handleQuizSubmit = (e) => {
    e.preventDefault();
    const answer = e.target.answer.value;
    if (answer === '5') {
      setQuizScore(5);
      setFeedback('Correct! You’ve conquered the archipelago’s secrets!');
    } else {
      setFeedback('Not quite! The archipelago needs 5 bridges.');
    }
    setStage('result');
  };

  const handleNextLevel = () => {
            window.location.href = '/BubbleSort';

    console.log('Proceeding to next level (placeholder)');
  };

  const handleBackToDashboard = () => {
        window.location.href = '/dashboard';

    console.log('Navigating to dashboard (placeholder)');
  };

  const totalScore = gameScore + quizScore;

  const getStars = () => {
    if (totalScore >= 30) return '⭐⭐⭐';
    if (totalScore >= 20) return '⭐⭐';
    return '⭐';
  };

  return (
    <div>
      <style>
        {`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Arial', sans-serif;
            overflow: hidden;
            background: linear-gradient(135deg, #0a0e1a, #1a2a44);
          }
          .container {
            position: relative;
            width: 100vw;
            height: 100vh;
            background-size: cover;
            background-position: center;
            animation: wave 20s linear infinite;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .game-area {
            position: relative;
            width: 100%;
            height: 100%;
          }
          .overlay {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 1s ease-in-out;
            z-index: 9999;
          }
          .panel {
            background: rgba(15, 30, 60, 0.9);
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.4), inset 0 0 10px rgba(0, 255, 255, 0.2);
            border: 1px solid #00ffff;
            border-radius: 15px;
            padding: 3rem;
            color: #e0e0e0;
            text-align: center;
            max-width: 1400px;
            animation: neonGlow 2s ease-in-out infinite;
          }
          .panel h2 {
            font-size: 3.5rem;
            margin-bottom: 1.5rem;
            color: #00ffff;
            text-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff;
          }
          .panel p {
            font-size: 1.7rem;
            margin-bottom: 1.5rem;
            color: #b0c4de;
          }
          .button {
            padding: 0.8rem 1.5rem;
            border: none;
            border-radius: 6px;
            color: #fff;
            font-size: 2rem;
            cursor: pointer;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
          }
          .button:hover {
            transform: scale(1.1);
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
          }
          .button-back {
            background: linear-gradient(to right, #ff2e63, #252525);
            position: absolute;
            top: 1rem;
            right: 1rem;
            font-size: 0.8rem;
            padding: 0.5rem 1rem;
          }
          .button-back-result {
            background: linear-gradient(to right, #ff2e63, #252525);
            margin: 0 0.5rem;
          }
          .button-intro {
            background: linear-gradient(to right, #ff2e63, #ff9f43);
          }
          .button-game {
            background: linear-gradient(to right, #00ddeb, #00a3ee);
            position: absolute;
            bottom: 1rem;
            left: 50%;
            transform: translateX(-50%);
          }
          .button-quiz {
            background: linear-gradient(to right, #00ff87, #60efff);
          }
          .button-result {
            background: linear-gradient(to right, #ff5e62, #feca57);
            margin-right: 0.5rem;
          }
          .button-next {
            background: linear-gradient(to right, #9b59b6, #8e44ad);
          }
          .game-container {
            width: 100%;
            height: 100%;
            position: relative;
          }
          .score-panel {
            position: absolute;
            top: 1rem;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.85);
            box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
            border: 1px solid #00ffff;
            border-radius: 8px;
            padding: 0.8rem;
            color: #00ffff;
            font-size: 0.9rem;
            z-index: 10;
          }
          .instruction {
            position: absolute;
            top: 4rem;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.85);
            box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
            border: 1px solid #00ffff;
            border-radius: 8px;
            padding: 0.8rem;
            color: #b0c4de;
            font-size: 1.5rem;
            z-index: 10;
            text-shadow: 0 0 5px #00ffff;
            max-width: 900px;
          }
          .progress-bar-container {
            width: 8rem;
            height: 0.3rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 9999px;
            margin-top: 0.3rem;
          }
          .progress-bar {
            height: 100%;
            background: linear-gradient(to right, #00ff87, #00ddeb);
            border-radius: 9999px;
            transition: width 0.5s ease;
            box-shadow: 0 0 8px #00ff87;
          }
          .island {
            position: absolute;
            width: 80px;
            height: 80px;
            cursor: pointer;
            transform: translate(-50%, -50%);
            transition: transform 0.3s ease;
            animation: float 3s ease-in-out infinite;
            z-index: 5;
          }
          .island:hover {
            transform: translate(-50%, -50%) scale(1.5);
          }
          .island img {
            width: 100%;
            height: 100%;
          }
          .island-name {
            position: absolute;
            bottom: -35px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 255, 255, 0.85);
            color: #000000;
            font-size: 1.1rem;
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
            border: 1px solid #00ffff;
            white-space: nowrap;
            z-index: 6;
          }
          .bridge {
  position: absolute;
  transform-origin: center center;
  pointer-events: none;
  z-index: 3;
  border-radius: 4px;
  box-shadow: 0 0 6px rgba(0, 255, 255, 0.7);
}

          .bridge-animate {
            transform: scale(1.1);
          }
          .quiz-form {
            background: rgba(15, 30, 60, 0.9);
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.4);
            border: 1px solid #00ffff;
            border-radius: 12px;
            padding: 2rem;
            color: #e0e0e0;
            max-width: 750px;
            margin: 3rem auto;
                        font-size: 2rem;

          }
          .quiz-form h3 {
            font-size: 3rem;
            margin-bottom: 1rem;
            color: #00ffff;
            text-shadow: 0 0 10px #00ffff;
          }
          .quiz-form label {
            display: block;
            margin: 0.5rem 0;
            font-size: 2rem;
            color: #b0c4de;
          }
          .quiz-form input {
            margin-right: 0.3rem;
            accent-color: #00ffff;
          }
          .stars {
            font-size: 2rem;
            margin: 1rem 0;
            color: #ffeb3b;
            animation: neonGlow 1.8s ease-in-out infinite;
          }
          .particle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: radial-gradient(circle, rgba(0,255,255,0.9) 0%, rgba(0,255,255,0) 70%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 4;
          }
          .diagram-container {
            display: flex;
            justify-content: space-around;
            margin: 2rem 0;
          }
          .diagram {
            text-align: center;
          }
          .diagram h4 {
            color: #00ffff;
            margin-bottom: 0.5rem;
          }
          svg {
            filter: drop-shadow(0 0 5px rgba(0, 255, 255, 0.5));
          }
          @keyframes wave {
            0% { background-position: 0 0; }
            100% { background-position: 1000px 0; }
          }
          @keyframes neonGlow {
            0% { text-shadow: 0 0 8px #00ffff, 0 0 15px #00ffff; }
            50% { text-shadow: 0 0 15px #00ffff, 0 0 30px #00ffff; }
            100% { text-shadow: 0 0 8px #00ffff, 0 0 15px #00ffff; }
          }
          @keyframes float {
            0% { transform: translate(-50%, -50%) translateY(0); }
            50% { transform: translate(-50%, -50%) translateY(-7px); }
            100% { transform: translate(-50%, -50%) translateY(0); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes bridgeBuild {
            from { transform: scale(0); opacity: 0; }
            to { transform: scale(1.1); opacity: 1; }
          }
            @media (max-width: 768px) {
  .panel {
    padding: 1.5rem;
    max-width: 95%;
  }

  .panel h2 {
    font-size: 2rem;
  }

  .panel p {
    font-size: 1rem;
  }

  .button {
    font-size: 1rem;
    padding: 0.6rem 1rem;
  }

  .score-panel {
    font-size: 0.7rem;
    padding: 0.4rem;
  }

  .instruction {
    font-size: 1rem;
    padding: 0.5rem;
    max-width: 95%;
  }

  .island {
    width: 50px;
    height: 50px;
  }

  .island-name {
    font-size: 0.8rem;
    bottom: -25px;
    padding: 0.1rem 0.3rem;
  }

  .quiz-form {
    font-size: 1rem;
    padding: 1rem;
  }

  .quiz-form h3 {
    font-size: 1.5rem;
  }
}

        `}
      </style>
      <div
        className="container"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
      <button
  className="button button-back"
  style={{ zIndex: 9999, position: "absolute" }}
  onClick={togglePause}
>
  {isPaused ? "Resume" : "Pause"}
</button>



        <div className="game-area">
          {stage === 'intro' && (
            <div className="overlay">
              <div className="panel">
                <h2>🌊 The Archipelago Quest</h2>
                <p>
                  In the cosmic sea, the Archipelago awaits—six enchanted islands bound by fate. As the Bridge Builder, weave neon bridges to unite their tribes and unlock the secrets of the graph sages. Begin your quest!
                </p>
                <button
                  className="button button-intro"
                  onClick={() => setStage('game')}
                >
                  Start Quest
                </button>
              </div>
            </div>
          )}

          {stage === 'game' && (
            <div className="game-container">
              <div className="score-panel">
                <p>Score: {gameScore} / 25</p>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar"
                    style={{ width: `${(gameScore / 25) * 100}%` }}
                  ></div>
                </div>
              </div>
              <p className="instruction">
                Select two islands to create a bridge between them.
              </p>
              {particles.map((p) => (
                <div
                  key={p.id}
                  className="particle"
                  style={{
                    left: p.x,
                    top: p.y,
                    transform: `translate(${p.vx * (1 - p.life)}px, ${p.vy * (1 - p.life)}px)`,
                    opacity: p.life,
                  }}
                />
              ))}
           {bridges.map((bridge, index) => {
  const from = islands.find((i) => i.id === bridge.from);
  const to = islands.find((i) => i.id === bridge.to);

  if (!from || !to) return null;

  // Convert % strings to numbers
  const fromXPercent = parseFloat(from.x);
  const fromYPercent = parseFloat(from.y);
  const toXPercent = parseFloat(to.x);
  const toYPercent = parseFloat(to.y);

  // Convert % → pixels (based on viewport size)
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const fromX = (fromXPercent / 100) * vw;
  const fromY = (fromYPercent / 100) * vh;
  const toX = (toXPercent / 100) * vw;
  const toY = (toYPercent / 100) * vh;

  const dx = toX - fromX;
  const dy = toY - fromY;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const length = Math.sqrt(dx * dx + dy * dy);

  // Midpoint in %
  const midX = (fromXPercent + toXPercent) / 2;
  const midY = (fromYPercent + toYPercent) / 2;

  return (
    <div
      key={index}
      className="bridge bridge-animate"
      style={{
        left: `${midX}%`,
        top: `${midY}%`,
        width: `${length}px`, // ✅ fixed width in pixels
        height: "6px",        // ✅ thinner bridge
        background: `url(${bridgeImage}) center / cover no-repeat`,
        transform: `translate(-50%, -50%) rotate(${angle}deg)`,
      }}
    />
  );
})}



              {islands.map((island, index) => (
               <div
  key={island.id}
  className="island"
  style={{ left: island.x, top: island.y }}
  onClick={() => handleIslandClick(island.id)}
>
                  <img
                    src={islandImages[index % islandImages.length]}
                    alt={`Island ${island.id}`}
                  />
                  <span className="island-name">{island.name}</span>
                </div>
              ))}

              <button
                className="button button-game"
                onClick={() => setStage('outro')}
              >
                End Quest & Learn Secrets
              </button>
            </div>
          )}

          {stage === 'outro' && (
            <div className="overlay">
              <div className="panel">
                <h2>🧙‍♂️ Secrets of Trees and Graphs</h2>
                <p>
                  Your bridges form a <strong>graph</strong>, a network of nodes (islands) and edges (bridges). A <strong>tree</strong> is a special graph with no cycles, connecting all nodes with the fewest edges.
                </p>
                <div className="diagram-container">
                  <div className="diagram">
                    <h4>Tree</h4>
                    <svg width="150" height="100">
                      <circle cx="75" cy="20" r="10" fill="#00ffff" />
                      <circle cx="50" cy="60" r="10" fill="#00ffff" />
                      <circle cx="100" cy="60" r="10" fill="#00ffff" />
                      <line x1="75" y1="20" x2="50" y2="60" stroke="#00ffff" strokeWidth="2" />
                      <line x1="75" y1="20" x2="100" y2="60" stroke="#00ffff" strokeWidth="2" />
                    </svg>
                    <p>No cycles, fully connected.</p>
                  </div>
                  <div className="diagram">
                    <h4>Graph</h4>
                    <svg width="150" height="100">
                      <circle cx="50" cy="20" r="10" fill="#00ffff" />
                      <circle cx="100" cy="20" r="10" fill="#00ffff" />
                      <circle cx="50" cy="80" r="10" fill="#00ffff" />
                      <circle cx="100" cy="80" r="10" fill="#00ffff" />
                      <line x1="50" y1="20" x2="100" y2="20" stroke="#00ffff" strokeWidth="2" />
                      <line x1="50" y1="20" x2="50" y2="80" stroke="#00ffff" strokeWidth="2" />
                      <line x1="100" y1="20" x2="100" y2="80" stroke="#00ffff" strokeWidth="2" />
                      <line x1="50" y1="80" x2="100" y2="80" stroke="#00ffff" strokeWidth="2" />
                      <line x1="50" y1="20" x2="100" y2="80" stroke="#00ffff" strokeWidth="2" />
                    </svg>
                    <p>May have cycles, more edges.</p>
                  </div>
                </div>
                <p>
                  In this quest, 5 bridges form a tree to connect 6 islands, ensuring all are linked without wasteful cycles.
                </p>
                <button
                  className="button button-quiz"
                  onClick={() => setStage('quiz')}
                >
                  Face the Trial
                </button>
              </div>
            </div>
          )}

          {stage === 'quiz' && (
            <div className="overlay">
              <form className="quiz-form" onSubmit={handleQuizSubmit}>
                <h3>🧙‍♂️ Trial of the Graph Sages</h3>
                <p>
                  How many bridges are needed to fully connect 6 islands, ensuring each is reachable?
                </p>
                <label>
                  <input type="radio" name="answer" value="4" /> 4
                </label>
                <label>
                  <input type="radio" name="answer" value="5" /> 5
                </label>
                <label>
                  <input type="radio" name="answer" value="6" /> 6
                </label>
                <button className="button button-quiz" type="submit">
                  Submit Answer
                </button>
              </form>
            </div>
          )}

          {stage === 'result' && (
            <div className="overlay">
              <div className="panel">
                <h2>🏆 Quest Complete</h2>
                <p>Bridge Score: {gameScore} / 25</p>
                <p>Trial Score: {quizScore} / 5</p>
                <p style={{ fontWeight: 'bold' }}>Total Score: {totalScore}</p>
                <p style={{ margin: '1rem 0' }}>{feedback}</p>
                <div className="stars">Your Legend: {getStars()}</div>
                <div>
                  <button
                    className="button button-result"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </button>
                  <button
                    className="button button-back-result"
                    onClick={handleBackToDashboard}
                  >
                    Back
                  </button>
                  <button
                    className="button button-next"
                    onClick={handleNextLevel}
                  >
                    Next Level
                  </button>
                </div>
              </div>
            </div>
          )}
          {isPaused && (
  <div className="overlay">
    <div className="panel">
      <h2>⏸ Game Paused</h2>
      <div style={{ marginTop: "1rem" }}>
        <button className="button button-intro" onClick={togglePause}>
          Resume
        </button>
        <button className="button button-result" onClick={restartGame}>
          Restart
        </button>
        <button className="button button-back-result" onClick={handleBackToDashboard}>
          Dashboard
        </button>
      </div>
    </div>
  </div>
)}

        </div>
      </div>
    </div>
  );
};

export default BridgeGame;