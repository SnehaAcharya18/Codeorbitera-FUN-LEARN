import React, { useState, useEffect } from "react";
import axios from "axios";

// Importing audio files
import bacMp3 from "../../assets/sounds/hardlevel2/bac.mp3";
import clicMp3 from "../../assets/sounds/hardlevel2/clic.wav";
import wronMp3 from "../../assets/sounds/hardlevel2/wron.mp3";

const PasswordCrack = () => {
  const targetPassword = "347";
  const maxDigits = 3;

  const [stage, setStage] = useState("intro");
  const [input, setInput] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem("isBackgroundMusicPlaying") === "false";
  });
  const [isPaused, setIsPaused] = useState(false);

  const backgroundAudio = new Audio(bacMp3);
  const clickSound = new Audio(clicMp3);
  const wrongSound = new Audio(wronMp3);

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
      postScore("Level 12", score);
    }
  }, [stage]);

  useEffect(() => {
    backgroundAudio.loop = true;
    if (!isMuted) {
      backgroundAudio.play().catch((error) => console.error("Background audio play failed:", error));
    }
    localStorage.setItem("isBackgroundMusicPlaying", !isMuted);
    return () => {
      backgroundAudio.pause();
    };
  }, [isMuted]);

  const handleToggleMute = () => {
    if (isMuted) {
      backgroundAudio.play().catch((error) => console.error("Background audio play failed:", error));
    } else {
      backgroundAudio.pause();
    }
    setIsMuted(!isMuted);
  };

  const handleDigitClick = (digit) => {
    if (isPaused) return;
    clickSound.play().catch((error) => console.error("Click sound failed:", error));
    if (input.length < maxDigits) setInput((prev) => prev + digit);
  };

  const handleBacktrack = () => {
    if (isPaused) return;
    clickSound.play().catch((error) => console.error("Click sound failed:", error));
    setInput((prev) => prev.slice(0, -1));
  };

  const handleTryGuess = () => {
    if (isPaused) return;
    setAttempts((a) => a + 1);
    if (input === targetPassword) {
      setFeedback("");
      setStage("outro");
    } else {
      wrongSound.play().catch((error) => console.error("Wrong sound failed:", error));
      setFeedback("wrong");
    }
  };

  const handleQuizSubmit = (e) => {
    if (isPaused) return;
    e.preventDefault();
    const q1 = e.target.q1.value;
    const q2 = e.target.q2.value;
    let points = 0;
    if (q1 === "call itself") points += 5;
    if (q2 === "trying all paths and undoing") points += 5;
    setQuizScore(points);
    setScore(10 - attempts + points);
    setFeedback("");
    setStage("result");
  };

  const getStars = () => {
    const total = 10 - attempts + quizScore;
    if (total >= 13) return "⭐⭐⭐";
    if (total >= 10) return "⭐⭐";
    return "⭐";
  };

  const handlePause = () => {
    setIsPaused(true);
    backgroundAudio.pause();
  };

  const handleResume = () => {
    setIsPaused(false);
    if (!isMuted) {
      backgroundAudio.play().catch((error) => console.error("Background audio play failed:", error));
    }
  };

  const handleRestart = () => {
    setAttempts(0);
    setInput("");
    setStage("game");
    setFeedback("");
    setIsPaused(false);
    if (!isMuted) {
      backgroundAudio.play().catch((error) => console.error("Background audio play failed:", error));
    }
  };

  const handleBackToDashboard = () => {
    window.location.href = '/dashboard';
  };

  const handleNextLevel = () => {
    window.location.href = '/DebuggerGame';
  };

  return (
    <>
      <style>
        {`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            overflow: hidden;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }
          .wrong-guess {
            animation: shake 0.5s ease-in-out;
            color: #ff4747;
          }
          button:hover {
            transform: scale(1.05);
            box-shadow: 0 0 20px rgba(0, 255, 204, 0.8);
          }
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');

          /* Media Queries for Mobile Responsiveness */
          @media (max-width: 768px) {
            .container {
              padding: 1rem;
            }
            .title {
              font-size: 4rem;
              margin-bottom: 0.5rem;
            }
            .panel {
              width: 95%;
              padding: 1rem;
            }
            .text {
              font-size: 2rem;
            }
            .button, .introButton {
              font-size: 1rem;
              padding: 0.75rem 1.5rem;
              margin: 0.5rem;
            }
            .digit {
              width: 50px;
              height: 50px;
              font-size: 1.5rem;
              margin: 3px;
            }
            .code {
              font-size: 2rem;
              letter-spacing: 0.3rem;
            }
            .feedback {
              font-size: 1rem;
            }
            .pauseButton, .muteButton {
              font-size: 0.9rem;
              padding: 0.4rem 0.8rem;
            }
            .pauseMenu {
              width: 80%;
              padding: 1rem;
            }
          }
          @media (max-width: 480px) {
            .title {
              font-size: 1.2rem;
            }
            .panel {
              width: 100%;
              padding: 0.8rem;
            }
            .text {
              font-size: 1rem;
            }
            .button, .introButton {
              font-size: 0.9rem;
              padding: 0.5rem 1rem;
            }
            .digit {
              width: 40px;
              height: 40px;
              font-size: 1.2rem;
              margin: 2px;
            }
            .code {
              font-size: 1.5rem;
              letter-spacing: 0.2rem;
            }
            .feedback {
              font-size: 0.9rem;
            }
            .pauseButton, .muteButton {
              font-size: 0.8rem;
              padding: 0.3rem 0.6rem;
            }
            .pauseMenu {
              width: 90%;
              padding: 0.8rem;
            }
            .digits {
              gap: 2px;
            }
          }
        `}
      </style>
      <div style={styles.container} className="container">
        <button
          style={styles.pauseButton}
          className="pauseButton"
          onClick={handlePause}
          disabled={isPaused}
        >
          ⏸️ Pause
        </button>
        <button
          style={styles.muteButton}
          className="muteButton"
          onClick={handleToggleMute}
        >
          {isMuted ? "🔇 Unmute" : "🔊 Mute"}
        </button>

        {isPaused && (
          <div style={styles.pauseMenu} className="pauseMenu">
            <button style={styles.button} onClick={handleResume}>▶️ Resume</button>
            <button style={styles.button} onClick={handleRestart}>🔄 Restart</button>
            <button style={styles.button} onClick={handleBackToDashboard}>🏠 Dashboard</button>
          </div>
        )}

        <h1 style={styles.title} className="title">Hacker's Challenge: The Firewall Gauntlet</h1>

        {stage === "intro" && (
          <div style={styles.panel} className="panel">
            <p style={styles.text} className="text">
              The AI overlord KARMA has locked the secret files. You must manually recurse through the firewall using your hacker skills.
              Break the 3-digit password using backtracking. Beware, the system evolves.
            </p>
            <button
              style={styles.introButton}
              className="introButton"
              onClick={() => setStage("game")}
            >
              💻 Initiate Hack Sequence
            </button>
          </div>
        )}

        {stage === "game" && (
          <div style={styles.panel} className="panel">
            <p style={styles.text} className="text">Enter the 3-digit password:</p>
            <div style={styles.code} className={feedback === "wrong" ? "wrong-guess code" : "code"}>
              {input}
            </div>
            <div style={styles.digits} className="digits">
              {[...Array(10).keys()].map((n) => (
                <button key={n} style={styles.digit} className="digit" onClick={() => handleDigitClick(n.toString())} disabled={isPaused}>{n}</button>
              ))}
            </div>
            <button style={styles.button} className="button" onClick={handleBacktrack} disabled={isPaused}>🔙 Backtrack</button>
            <button style={styles.button} className="button" onClick={handleTryGuess} disabled={input.length !== 3 || isPaused}>🚀 Try Guess</button>
            <p style={styles.text} className="text">Attempts: {attempts}</p>
          </div>
        )}

        {feedback === "wrong" && stage === "game" && (
          <div style={styles.feedback} className="feedback">
            <p style={styles.text} className="text">❌ Wrong Guess! Try again...</p>
          </div>
        )}

        {stage === "outro" && (
          <div style={styles.panel} className="panel">
            <h2 style={styles.text} className="text">✅ Access Granted</h2>
            <p style={styles.text} className="text">You’ve unlocked the firewall. But do you really understand recursion and backtracking?</p>
            <button style={styles.button} className="button" onClick={() => setStage("quiz")} disabled={isPaused}>Take the Final Quiz</button>
          </div>
        )}

        {stage === "quiz" && (
          <form style={styles.panel} className="panel" onSubmit={handleQuizSubmit}>
            <p style={styles.text} className="text">🧠 What is recursion?</p>
            <label style={styles.text} className="text"><input type="radio" name="q1" value="loop forever" disabled={isPaused} /> Loop forever</label><br />
            <label style={styles.text} className="text"><input type="radio" name="q1" value="call itself" disabled={isPaused} /> A function that can call itself</label><br />

            <p style={styles.text} className="text">🧠 What is backtracking?</p>
            <label style={styles.text} className="text"><input type="radio" name="q2" value="go forward only" disabled={isPaused} /> Go forward only</label><br />
            <label style={styles.text} className="text"><input type="radio" name="q2" value="trying all paths and undoing" disabled={isPaused} /> Trying all paths and undoing wrong ones</label><br /><br />

            <button style={styles.button} className="button" disabled={isPaused}>Submit Quiz</button>
          </form>
        )}

        {stage === "result" && (
          <div style={styles.panel} className="panel">
            <h2 style={styles.text} className="text">🎉 Mission Complete</h2>
            <p style={styles.text} className="text">Password Attempts: {attempts}</p>
            <p style={styles.text} className="text">Quiz Score: {quizScore}/10</p>
            <p style={styles.text} className="text">Total Score: {score}/20</p>
            <h3 style={styles.text} className="text">Your Rating: {getStars()}</h3>
            <button style={styles.button} className="button" onClick={handleRestart}>Try Again</button>
            <button style={styles.button} className="button" onClick={handleNextLevel}>Next Level</button>
          </div>
        )}
      </div>
    </>
  );
};

const styles = {
  container: {
    fontFamily: "'Orbitron', sans-serif",
    backgroundColor: "#0a0a0a",
    color: "#00ffcc",
    minHeight: "100vh",
    width: "100vw",
    margin: 0,
    padding: "2rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    textShadow: "0 0 5px #00ffcc, 0 0 10px #00ffcc, 0 0 15px #00ffcc",
    boxSizing: "border-box",
  },
  pauseButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    backgroundColor: "#ffcc00",
    color: "#000",
    border: "none",
    borderRadius: "5px",
    padding: "0.5rem 1rem",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: "0 0 15px rgba(255, 204, 0, 0.6)",
    fontSize: "1.2rem",
    letterSpacing: "1px",
  },
  muteButton: {
    position: "absolute",
    top: "10px",
    left: "10px",
    backgroundColor: "#00ffcc",
    color: "#000",
    border: "none",
    borderRadius: "5px",
    padding: "0.5rem 1rem",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: "0 0 15px rgba(0, 255, 204, 0.6)",
    fontSize: "1.2rem",
    letterSpacing: "1px",
  },
  pauseMenu: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#111",
    border: "1px solid #00ffcc",
    borderRadius: "10px",
    padding: "1.5rem",
    boxShadow: "0px 0px 20px rgba(0, 255, 204, 0.5)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    zIndex: 1000,
    width: "80%",
    maxWidth: "400px",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: "1rem",
    textAlign: "center",
    letterSpacing: "2px",
    textShadow: "0 0 10px #00ffcc, 0 0 20px #00ffcc",
  },
  panel: {
    backgroundColor: "#111",
    border: "1px solid #00ffcc",
    borderRadius: "10px",
    padding: "1.5rem",
    width: "100%",
    maxWidth: "1300px",
    boxShadow: "0px 0px 20px rgba(0, 255, 204, 0.5)",
    animation: "fadeIn 0.5s ease-in-out",
  },
  text: {
    margin: "0.5rem 0",
    fontSize: "1.5rem",
    lineHeight: "1.4",
  },
  button: {
    backgroundColor: "#00ffcc",
    border: "none",
    borderRadius: "5px",
    padding: "1rem 2rem",
    fontSize: "25px",
    margin: "1rem",
    cursor: "pointer",
    color: "#000",
    fontWeight: "bold",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: "0 0 15px rgba(0, 255, 204, 0.6)",
  },
  introButton: {
    backgroundColor: "#00ff99",
    color: "#111",
    fontSize: "1.5rem",
    border: "none",
    borderRadius: "10px",
    padding: "1rem 2rem",
    cursor: "pointer",
    fontWeight: "bold",
    letterSpacing: "1px",
    boxShadow: "0 5px 15px rgba(0, 255, 204, 0.7)",
    animation: "pulse 1.5s infinite",
  },
  digit: {
    backgroundColor: "#222",
    color: "#00ffcc",
    border: "1px solid #00ffcc",
    borderRadius: "5px",
    width: "70px",
    height: "70px",
    margin: "5px",
    cursor: "pointer",
    transition: "transform 0.2s",
    fontSize: "2rem",
  },
  digits: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    margin: "1rem 0",
    gap: "5px",
  },
  code: {
    fontSize: "3rem",
    letterSpacing: "0.5rem",
    textAlign: "center",
    margin: "1rem",
  },
  feedback: {
    textAlign: "center",
    color: "#ff4747",
    fontSize: "1.5rem",
  },
};

export default PasswordCrack;