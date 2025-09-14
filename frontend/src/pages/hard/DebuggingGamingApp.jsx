import React, { useEffect, useRef, useState, useCallback } from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/theme-monokai";
import axios from "axios";
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { oneDark } from '@codemirror/theme-one-dark';
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
// Import assets from src folder
import bgImage from "../../assets/images/hardlast/last.jpg";
import backgroundMusic from "../../assets/sounds/hardlast/bg.mp3";
import clickSound from "../../assets/sounds/hardlast/click.wav";

// Import Google Orbitron font and add responsive styles
const responsiveStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');

  @media (max-width: 768px) {
    .overlay {
      padding: 10px;
    }
    .overlay > div {
      max-width: 90vw;
      padding: 15px;
    }
    .mission-text {
      font-size: 14px;
      width: 90vw;
      padding: 10px;
      top: 20vh; /* Increased from 15vh to push down */
    }
    .editor-container {
      width: 90vw;
      height: 30vh;
      bottom: 15vh;
    }
    .button-container {
      flex-direction: column;
      width: 80vw;
      bottom: 10vh; /* Increased from 5vh to push down */
    }
    .button-container button {
      width: 50%;
      margin: 5px 0;
      padding: 10px;
      font-size: 16px;
    }
    .game-header {
      flex-direction: column;
      align-items: center;
      padding: 10px;
    }
    .score-display, .time-display {
      font-size: 10px;
      margin: 5px 0;
    }
    .pause-button {
      font-size: 14px;
      padding: 6px 12px;
      margin-top: 5px;
    }
    .code-editor-panel {
      width: 100vw;
      max-width: 100%;
      padding: 15px;
    }
    .code-editor-panel textarea {
      height: 80px;
      font-size: 14px;
    }
  }

  @media (max-width: 480px) {
    .overlay h2 {
      font-size: 20px;
    }
    .overlay p {
      font-size: 12px;
    }
    .mission-text {
      font-size: 12px;
      top: 15vh; /* Increased from 10vh to push down */
    }
    .editor-container {
      height: 25vh;
      bottom: 10vh;
    }
    .button-container {
      bottom: 7vh; /* Increased from 2vh to push down */
    }
    .game-header {
      padding: 5px;
    }
    .score-display, .time-display {
      font-size: 10px;
    }
    .pause-button {
      font-size: 12px;
    }
    .code-editor-panel h3 {
      font-size: 20px;
    }
    .code-editor-panel {
      padding: 10px;
    }
  }
`;

const ElevaterGame = () => {
  const [showOverlay, setShowOverlay] = useState("intro");
  const [score, setScore] = useState(1000);
  const [time, setTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [level, setLevel] = useState(1);
  const [editorValue, setEditorValue] = useState(
    `#include <iostream>\nusing namespace std;\n\nint main() {\n    int arr[2][3] = {{1, 2, 3}, {4, 5, 6}};\n    int sum = 0;\n    for (int i = 1; i < 2; i++) {\n        for (int j = 0; j <= arr[i].length; j++) {\n            sum += arr[j][i];\n        }\n    }\n    cout << "Total Energy: " << sum << endl;\n    return 0;\n}`
  );
  const [codeEditorCode, setCodeEditorCode] = useState(
    `#include <iostream>\nusing namespace std;\n\nint main() {\n    int arr[2][3] = {{1, 2, 3}, {4, 5, 6}};\n    int sum = 0;\n    for (int i = 1; i < 2; i++) {\n        for (int j = 0; j <= arr[i].length; j++) {\n            sum += arr[j][i];\n        }\n    }\n    cout << "Total Energy: " << sum << endl;\n    return 0;\n}`
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
  const navigate = useNavigate();
  const { state } = useLocation();
  const totalScore = state?.totalScore || 0; // Retrieve totalScore from navigation state

  useEffect(() => {
    if (showOverlay === "stars") {
      postScore("Level 15", score);
    }
  }, [showOverlay]);

  // Initialize audio
  useEffect(() => {
    backgroundMusicRef.current = new Audio(backgroundMusic);
    backgroundMusicRef.current.loop = true;
    backgroundMusicRef.current.volume = 0.3;

    clickSoundRef.current = new Audio(clickSound);
    clickSoundRef.current.volume = 0.5;

    const shouldPlayMusic = localStorage.getItem("playBackgroundMusic") !== "false";
    if (shouldPlayMusic) {
      backgroundMusicRef.current
        .play()
        .then(() => {
          console.log("Background music playing");
          localStorage.setItem("playBackgroundMusic", "true");
          setAudioError(null);
        })
        .catch((error) => {
          console.log("Error playing background music:", error.message);
          setAudioError("Failed to play background music");
        });
    }

    return () => {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
      }
    };
  }, []);

  // Timer logic
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
    setIsPaused(false);
    setShowOverlay("");
    setTime(0);
    setScore(1000);
    scoreRef.current = 1000;
    timeRef.current = 0;
    setQuizPassed(false);
    setStars(3);
    setCodeSubmitted(false);
    setEditorValue(
      `#include <iostream>\nusing namespace std;\n\nint main() {\n    int arr[2][3] = {{1, 2, 3}, {4, 5, 6}};\n    int sum = 0;\n    for (int i = 1; i < 2; i++) {\n        for (int j = 0; j <= arr[i].length; j++) {\n            sum += arr[j][i];\n        }\n    }\n    cout << "Total Energy: " << sum << endl;\n    return 0;\n}`
    );

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
    setShowOverlay("intro");
    setGameStarted(false);
    setIsPaused(false);
    setQuizPassed(false);
    setStars(3);
    setCodeSubmitted(false);
    setEditorValue(
      `#include <iostream>\nusing namespace std;\n\nint main() {\n    int arr[2][3] = {{1, 2, 3}, {4, 5, 6}};\n    int sum = 0;\n    for (int i = 1; i < 2; i++) {\n        for (int j = 0; j <= arr[i].length; j++) {\n            sum += arr[j][i];\n        }\n    }\n    cout << "Total Energy: " << sum << endl;\n    return 0;\n}`
    );
  };

  const goToNextLevel = () => {
    navigate("/certificate", { state: { totalScore } });
  };

  const goBack = () => {
    window.location.href = "/dashboard";
  };

  const submitCode = () => {
    const correctCode =
      editorValue.includes("for (int i = 0") &&
      editorValue.includes("i < 2") &&
      editorValue.includes("j < arr[i].length") &&
      editorValue.includes("sum += arr[i][j]");
    if (correctCode) {
      clearInterval(timerRef.current);
      setGameStarted(false);
      setIsPaused(false);
      setCodeSubmitted(true);
      setShowOverlay("outro");
    } else {
      alert(
        "Your code still has errors! Fix the outer loop start, inner loop condition, and array indexing."
      );
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
      setShowOverlay("stars");
    } else {
      alert("Incorrect, try again!");
      setScore((prevScore) => {
        const newScore = Math.max(prevScore - 50, 0);
        scoreRef.current = newScore;
        return newScore;
      });
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    playClickSound();
  };

  const resumeGame = () => {
    setIsPaused(false);
    playClickSound();
  };

  const playClickSound = () => {
    if (clickSoundRef.current) {
      clickSoundRef.current.currentTime = 0;
      clickSoundRef.current
        .play()
        .catch((error) => {
          console.log("Error playing click sound:", error.message);
          setAudioError("Failed to play click sound");
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

  const buttonStyle = (color) => ({
    background: `linear-gradient(45deg, ${color}CC, ${color}FF)`,
    border: `3px solid ${color}`,
    color: "#fff",
    padding: "12px 24px",
    margin: "10px",
    borderRadius: "10px",
    fontSize: "18px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "'Orbitron', sans-serif",
    textShadow: `0 0 10px ${color}, 0 0 20px ${color}`,
    boxShadow: `0 0 20px ${color}, 0 0 30px ${color}`,
    transition: "all 0.3s ease",
    transform: "scale(1)",
  });

  return (
    <>
      <style>{responsiveStyles}</style>
      <div
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {gameStarted && (
          <div
            className="game-header"
            style={{
              position: "absolute",
              top: "10px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 3,
            }}
          >
            <div
              className="score-display"
              style={{
                color: "#00FFFF",
                fontFamily: "'Orbitron', sans-serif",
                fontSize: "20px",
                fontWeight: "700",
                textShadow: "0 0 10px #00FFFF, 0 0 20px #00FFFF, 0 0 30px #00FFFF",
                background: "rgba(0, 0, 0, 0.7)",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "2px solid #00FFFF",
                boxShadow: "0 0 20px #00FFFF",
                margin: "0 10px",
              }}
            >
              🖥️ Score: {score}
            </div>
            <button
              onClick={togglePause}
              className="pause-button"
              style={{
                ...buttonStyle("#FFA500"),
                padding: "8px 16px",
                fontSize: "16px",
                margin: "0 10px",
              }}
            >
              ⏸️ Pause
            </button>
            <div
              className="time-display"
              style={{
                color: "#00FFFF",
                fontFamily: "'Orbitron', sans-serif",
                fontSize: "20px",
                fontWeight: "700",
                textShadow: "0 0 10px #00FFFF, 0 0 20px #00FFFF, 0 0 30px #00FFFF",
                background: "rgba(0, 0, 0, 0.7)",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "2px solid #00FFFF",
                boxShadow: "0 0 20px #00FFFF",
                margin: "0 10px",
              }}
            >
              ⏱️ Time: {time}s
            </div>
          </div>
        )}

        {audioError && showOverlay && (
          <div
            style={{
              position: "absolute",
              top: "60px",
              left: "50%",
              transform: "translateX(-50%)",
              color: "#FF0044",
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "16px",
              textShadow: "0 0 10px #FF0044",
              background: "rgba(0, 0, 0, 0.7)",
              padding: "8px 12px",
              borderRadius: "8px",
              zIndex: 3,
            }}
          >
            ⚠️ {audioError}
          </div>
        )}

        {(showOverlay || isPaused) && (
          <div
            className="overlay"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(50, 0, 100, 0.95))",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2,
              fontFamily: "'Orbitron', sans-serif",
              textAlign: "center",
              padding: "20px",
            }}
          >
            <div
              style={{
                background: "rgba(0, 0, 0, 0.7)",
                border: "3px solid #00FFFF",
                borderRadius: "15px",
                padding: "30px",
                boxShadow: "0 0 20px #00FFFF, 0 0 40px #00FFFF",
                maxWidth: "600px",
              }}
            >
              {showOverlay === "intro" && (
                <>
                  <h2
                    style={{
                      color: "#00FFFF",
                      fontSize: "32px",
                      textShadow: "0 0 10px #00FFFF, 0 0 20px #00FFFF, 0 0 30px #00FFFF",
                      fontWeight: "700",
                    }}
                  >
                    ⚡ Restore the Energy Grid! 💻
                  </h2>
                  <p
                    style={{
                      color: "#E0FF00",
                      fontSize: "18px",
                      margin: "20px 0",
                      textShadow: "0 0 10px #E0FF00",
                    }}
                  >
                    Sum the power cells in a 2x3 grid to restore the starship’s energy. Fix the nested loops and array indexing to compute the correct total! ⏰
                  </p>
                  <button
                    onClick={() => {
                      playClickSound();
                      startGame();
                    }}
                    style={buttonStyle("#00FFFF")}
                  >
                    🚀 Start Mission
                  </button>
                </>
              )}

              {showOverlay === "outro" && (
                <>
                  <h2
                    style={{
                      color: "#00FF00",
                      fontSize: "32px",
                      textShadow: "0 0 10px #00FF00, 0 0 20px #00FF00, 0 0 30px #00FF00",
                      fontWeight: "700",
                    }}
                  >
                    ✅ Energy Grid Restored! 🎉
                  </h2>
                  <p
                    style={{
                      color: "#E0FF00",
                      fontSize: "18px",
                      margin: "20px 0",
                      textShadow: "0 0 10px #E0FF00",
                    }}
                  >
                    Great work! Ready to test your debugging skills?
                  </p>
                  <button
                    onClick={() => {
                      playClickSound();
                      setShowOverlay("quiz");
                    }}
                    style={buttonStyle("#00FF00")}
                  >
                    🧠 Take Quiz
                  </button>
                </>
              )}

              {showOverlay === "quiz" && (
                <>
                  <h2
                    style={{
                      color: "#00FFFF",
                      fontSize: "32px",
                      textShadow: "0 0 10px #00FFFF, 0 0 20px #00FFFF, 0 0 30px #00FFFF",
                      fontWeight: "700",
                    }}
                  >
                    🧠 Quiz Time! ❓
                  </h2>
                  <p
                    style={{
                      color: "#E0FF00",
                      fontSize: "18px",
                      margin: "20px 0",
                      textShadow: "0 0 10px #E0FF00",
                    }}
                  >
                    What were the errors in the nested loop code?
                  </p>
                  {!quizPassed ? (
                    <>
                      <button
                        onClick={() => {
                          playClickSound();
                          handleQuizAnswer(true);
                        }}
                        style={buttonStyle("#00FF00")}
                      >
                        ✅ Incorrect outer loop start, off-by-one inner loop condition, and swapped array indices
                      </button>
                      <button
                        onClick={() => {
                          playClickSound();
                          handleQuizAnswer(false);
                        }}
                        style={buttonStyle("#FF0044")}
                      >
                        ❌ Missing curly braces in loops
                      </button>
                    </>
                  ) : (
                    <p
                      style={{
                        color: "#00FF00",
                        fontSize: "18px",
                        margin: "15px 0",
                        textShadow: "0 0 10px #00FF00",
                      }}
                    >
                      Correct! The outer loop started at 1, the inner loop had an off-by-one error, and the array indices were swapped.
                    </p>
                  )}
                </>
              )}

              {showOverlay === "stars" && (
                <>
                  <h2
                    style={{
                      color: "#00FFFF",
                      fontSize: "32px",
                      textShadow: "0 0 10px #00FFFF, 0 0 20px #00FFFF, 0 0 30px #00FFFF",
                      fontWeight: "700",
                    }}
                  >
                    🏆 Level {level} Complete! ⭐
                  </h2>
                  <p
                    style={{
                      color: "#E0FF00",
                      fontSize: "18px",
                      margin: "15px 0",
                      textShadow: "0 0 10px #E0FF00",
                    }}
                  >
                    Final Score: {score} / 1000
                  </p>
                  <p
                    style={{
                      color: "#E0FF00",
                      fontSize: "18px",
                      margin: "15px 0",
                      textShadow: "0 0 10px #E0FF00",
                    }}
                  >
                    Time Taken: {time} seconds
                  </p>
                  <p
                    style={{
                      color: "#FFFF00",
                      fontSize: "24px",
                      margin: "15px 0",
                      textShadow: "0 0 10px #FFFF00, 0 0 20px #FFFF00, 0 0 30px #FFFF00",
                    }}
                  >
                    Rating: {"⭐".repeat(stars)}
                  </p>
                  <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
                    <button
                      onClick={() => {
                        playClickSound();
                        goBack();
                      }}
                      style={buttonStyle("#FF4500")}
                    >
                      ⬅️ Back
                    </button>
                    <button
                      onClick={() => {
                        playClickSound();
                        restartGame();
                      }}
                      style={buttonStyle("#FF00FF")}
                    >
                      🔄 Restart
                    </button>
                    <button
                      onClick={() => {
                        playClickSound();
                        goToNextLevel();
                      }}
                      style={buttonStyle("#00FF00")}
                    >
                      ➡️ Get Certificate
                    </button>
                  </div>
                </>
              )}

              {isPaused && !showOverlay && (
                <>
                  <h2
                    style={{
                      color: "#FFA500",
                      fontSize: "32px",
                      textShadow: "0 0 10px #FFA500, 0 0 20px #FFA500, 0 0 30px #FFA500",
                      fontWeight: "700",
                    }}
                  >
                    ⏸️ Game Paused
                  </h2>
                  <p
                    style={{
                      color: "#E0FF00",
                      fontSize: "18px",
                      margin: "20px 0",
                      textShadow: "0 0 10px #E0FF00",
                    }}
                  >
                    Resume to continue, restart to try again, or return to dashboard.
                  </p>
                  <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
                    <button
                      onClick={() => {
                        playClickSound();
                        resumeGame();
                      }}
                      style={buttonStyle("#00FF00")}
                    >
                      ▶️ Resume
                    </button>
                    <button
                      onClick={() => {
                        playClickSound();
                        restartGame();
                      }}
                      style={buttonStyle("#FF00FF")}
                    >
                      🔄 Restart
                    </button>
                    <button
                      onClick={() => {
                        playClickSound();
                        goBack();
                      }}
                      style={buttonStyle("#FF4500")}
                    >
                      ⬅️ Dashboard
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {gameStarted && !codeSubmitted && (
          <div
            className="mission-text"
            style={{
              position: "absolute",
              top: "100px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "90vw",
              maxWidth: "760px",
              color: "#00FFFF",
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "25px",
              textAlign: "center",
              textShadow: "0 0 10px #00FFFF, 0 0 20px #00FFFF, 0 0 30px #00FFFF",
              background: "rgba(0, 0, 0, 0.7)",
              padding: "15px",
              borderRadius: "10px",
              border: "2px solid #00FFFF",
              boxShadow: "0 0 20px #00FFFF",
              zIndex: 1,
            }}
          >
            ⚡ <strong>Mission: Restore the Energy Grid!</strong> The starship’s power cells are in a 2x3 grid, but the summation code is faulty. Fix the nested loops to sum all cell values (1 to 6) and output "Total Energy: 21". Correct the outer loop start, inner loop condition, and array indexing to power up the ship! 🌌
          </div>
        )}

        {gameStarted && (
          <>
            <AceEditor
              mode="c_cpp"
              theme="monokai"
              value={editorValue}
              onChange={setEditorValue}
              fontSize={16}
              width="90vw"
              height="200px"
              className="editor-container"
              style={{
                position: "absolute",
                bottom: "20vh",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 1,
                borderRadius: "10px",
                border: "3px solid #00FFFF",
                boxShadow: "0 0 20px #00FFFF, 0 0 30px #00FFFF",
                backgroundColor: "rgba(0, 0, 0, 0.8)",
              }}
            />

            {!codeSubmitted && (
              <div
                className="button-container"
                style={{
                  position: "absolute",
                  bottom: "5vh",
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "90vw",
                  maxWidth: "760px",
                }}
              >
                <button
                  onClick={() => {
                    playClickSound();
                    setShowCodeEditor(true);
                  }}
                  style={{
                    ...buttonStyle("#FF00FF"),
                    width: "45%",
                    maxWidth: "650px",
                    marginRight: "10px",
                    color: "#fff",
                    top: "20px",
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
                    ...buttonStyle("#E0FF00"),
                    width: "45%",
                    maxWidth: "650px",
                    color: "#000",
                    top: "20px",
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
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="code-editor-panel"
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              width: "100vw",
              maxWidth: "100%",
              height: "100%",
              background: "rgba(0, 0, 0, 0.9)",
              zIndex: 3,
              padding: "25px",
              borderLeft: "4px solid #00FFFF",
              boxShadow: "-5px 0 20px rgba(0, 255, 255, 0.5)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h3 style={{
                color: "#00FFFF",
                fontFamily: "'Orbitron', sans-serif",
                fontSize: "32px",
                textShadow: "0 0 10px #00FFFF",
              }}>
                🧠 Code Testing
              </h3>
              <button
                onClick={() => {
                  playClickSound();
                  setShowCodeEditor(false);
                }}
                style={buttonStyle("#FF4500")}
              >
                Close
              </button>
            </div>
            <div style={{ flex: 1, overflow: "auto", marginBottom: "15px" }}>
              <CodeMirror
                value={codeEditorCode}
                theme={oneDark}
                height="350px"
                extensions={[cpp()]}
                onChange={(value) => setCodeEditorCode(value)}
                style={{ fontSize: '18px', borderRadius: '10px', border: '3px solid #00FFFF' }}
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label style={{
                color: "#E0FF00",
                fontFamily: "'Orbitron', sans-serif",
                fontSize: "20px",
                fontWeight: "700",
                textShadow: "0 0 10px #E0FF00",
                marginBottom: "10px",
                display: "block",
              }}>
                Standard Input (Optional):
              </label>
              <textarea
                value={codeEditorInput}
                onChange={(e) => setCodeEditorInput(e.target.value)}
                style={{
                  width: "100%",
                  height: "100px",
                  background: "rgba(0, 0, 0, 0.8)",
                  color: "#fff",
                  border: "3px solid #00FFFF",
                  borderRadius: "10px",
                  padding: "10px",
                  fontFamily: "monospace",
                  fontSize: "16px",
                  resize: "none",
                }}
              />
            </div>
            <div style={{ flex: 1, overflow: "auto", background: "rgba(0, 0, 0, 0.8)", borderRadius: "10px", padding: "10px", border: "3px solid #00FFFF" }}>
              <strong style={{
                color: "#E0FF00",
                fontFamily: "'Orbitron', sans-serif",
                fontSize: "20px",
                textShadow: "0 0 10px #E0FF00",
              }}>
                🔎 Output:
              </strong>
              <br />
              <pre style={{ color: "#fff", fontSize: "16px", whiteSpace: "pre-wrap" }}>{codeEditorOutput}</pre>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => {
                playClickSound();
                runCode();
              }}
              style={{
                marginTop: "15px",
                width: "100%",
                padding: "15px",
                background: codeEditorLoading
                  ? "linear-gradient(45deg, #666666CC, #666666FF)"
                  : "linear-gradient(45deg, #00FF00CC, #00FF00FF)",
                color: "#fff",
                fontSize: "20px",
                fontWeight: "700",
                borderRadius: "10px",
                border: "3px solid #00FF00",
                cursor: codeEditorLoading ? "not-allowed" : "pointer",
                fontFamily: "'Orbitron', sans-serif",
                textShadow: "0 0 10px #00FF00",
                boxShadow: "0 0 20px #00FF00",
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

export default ElevaterGame;