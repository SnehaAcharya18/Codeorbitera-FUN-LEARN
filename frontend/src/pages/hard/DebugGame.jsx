
import React, { useEffect, useRef, useState, useCallback } from "react";
import Phaser from "phaser";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/theme-monokai";
import { motion } from "framer-motion";
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { oneDark } from '@codemirror/theme-one-dark';
import axios from "axios";

// Import local audio files
import introMusic from "../../assets/sounds/hlevel15/intro_music.mp3";
import backgroundMusic from "../../assets/sounds/hlevel15/bg.mp3";
import clickSound from "../../assets/sounds/hlevel15/click.wav";
// Import local space-themed image
import spaceImage from "../../assets/images/hardlevel15/bg12.png";

// Import Google Orbitron font
const orbitronStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');
`;

const DebugGame = () => {
  const gameRef = useRef(null);
  const playButtonRef = useRef(null);
  const [showOverlay, setShowOverlay] = useState("intro");
  const [score, setScore] = useState(1000);
  const [time, setTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [level, setLevel] = useState(1);
  const [editorValue, setEditorValue] = useState(
    "#include <iostream>\nusing namespace std;\n\nint main() {\n    int x = 5;\n    if (x = 10) { // BUG: Should be == instead of =\n        cout << \"Hello\" << endl;\n    }\n    cout << \"x is not equal to 10\" << endl;\n    return 0;\n}"
  );
  const [codeEditorCode, setCodeEditorCode] = useState(
    "#include <iostream>\nusing namespace std;\n\nint main() {\n    int x = 5;\n    if (x = 10) { // BUG: Should be == instead of =\n        cout << \"Hello\" << endl;\n    }\n    cout << \"x is not equal to 10\" << endl;\n    return 0;\n}"
  );
  const [codeEditorInput, setCodeEditorInput] = useState('');
  const [codeEditorOutput, setCodeEditorOutput] = useState('');
  const [codeEditorLoading, setCodeEditorLoading] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [codeSubmitted, setCodeSubmitted] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [quizResult, setQuizResult] = useState("");
  const timerRef = useRef(null);
  const scoreRef = useRef(1000);
  const timeRef = useRef(0);
  const introMusicRef = useRef(null);
  const backgroundMusicRef = useRef(null);
  const clickSoundRef = useRef(null);
  const fallbackIntroAudioRef = useRef(null);
  const fallbackBackgroundAudioRef = useRef(null);

  const BACK_ARROW = "⬅️";
  const NEXT_ARROW = "➡️";

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
    if (showOverlay === "rating") {
      postScore("Level 11", score);
    }
  }, [showOverlay]);

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

  useEffect(() => {
    if (gameRef.current) return;

    class DebuggerScene extends Phaser.Scene {
      constructor() {
        super({ key: "DebuggerScene" });
      }

      preload() {
        console.log("Preload: Starting to load assets...");
        this.load.audio("intro_music", introMusic);
        this.load.audio("background_music", backgroundMusic);

        this.load.on("filecomplete-audio-intro_music", () => {
          console.log("Intro music loaded successfully");
          if (introMusicRef.current) {
            introMusicRef.current.on("play", () =>
              console.log("Phaser intro music playing")
            );
          }
        });
        this.load.on("filecomplete-audio-background_music", () => {
          console.log("Background music loaded successfully");
          if (backgroundMusicRef.current) {
            backgroundMusicRef.current.on("play", () =>
              console.log("Phaser background music playing")
            );
          }
        });
        this.load.on("loaderror", (file) => {
          console.error("Error loading file:", file.key, file.src);
          setAudioError(`Failed to load audio file: ${file.key}`);
        });

        this.load.on("complete", () => {
          console.log("Preload: All assets loaded");
        });
        this.load.start();
      }

      create() {
        console.log("Create: Setting up the scene...");
        this.cameras.main.setBackgroundColor("rgba(0, 0, 0, 0)");
        this.cameras.main.setAlpha(1);

        const graphics = this.add.graphics();
        graphics.lineStyle(5, 0xff0000);
        graphics.strokeRect(10, 10, 700, 520);
        console.log("Debug rectangle added");
        graphics.setDepth(0);
      }
    }

    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      width: 720,
      height: 540,
      scene: DebuggerScene,
      parent: "game-container",
      audio: {
        disableWebAudio: false,
      },
      transparent: true,
    });

    const canvas = document.querySelector("#game-container canvas");
    if (canvas) {
      console.log("Phaser canvas created:", canvas);
      console.log("Canvas dimensions:", canvas.width, canvas.height);
      console.log("Canvas visible:", canvas.style.display !== "none");
      console.log("Canvas z-index:", canvas.style.zIndex);
      console.log("Canvas opacity:", canvas.style.opacity || 1);
    } else {
      console.error("Phaser canvas not found in #game-container");
    }

    clickSoundRef.current = new Audio(clickSound);
    clickSoundRef.current.volume = 0.5;
    fallbackIntroAudioRef.current = new Audio(introMusic);
    fallbackBackgroundAudioRef.current = new Audio(backgroundMusic);
    fallbackBackgroundAudioRef.current.loop = true;
    fallbackIntroAudioRef.current.volume = 0.5;
    fallbackBackgroundAudioRef.current.volume = 0.3;

    clickSoundRef.current.addEventListener("loadeddata", () => {
      console.log(
        "Click sound loaded, duration:",
        clickSoundRef.current.duration
      );
    });
    fallbackIntroAudioRef.current.addEventListener("loadeddata", () => {
      console.log(
        "Fallback intro audio loaded, duration:",
        fallbackIntroAudioRef.current.duration
      );
    });
    fallbackBackgroundAudioRef.current.addEventListener("loadeddata", () => {
      console.log(
        "Fallback background audio loaded, duration:",
        fallbackBackgroundAudioRef.current.duration
      );
    });

    clickSoundRef.current.addEventListener("error", () => {
      console.error("Error loading click sound");
      setAudioError("Failed to load click sound");
    });
    fallbackIntroAudioRef.current.addEventListener("error", () => {
      console.error("Error loading fallback intro audio");
      setAudioError("Failed to load intro audio (fallback)");
    });
    fallbackBackgroundAudioRef.current.addEventListener("error", () => {
      console.error("Error loading fallback background audio");
      setAudioError("Failed to load background audio (fallback)");
    });

    return () => {
      if (gameRef.current) gameRef.current.destroy(true);
      if (clickSoundRef.current) clickSoundRef.current.pause();
      if (fallbackIntroAudioRef.current) fallbackIntroAudioRef.current.pause();
      if (fallbackBackgroundAudioRef.current)
        fallbackBackgroundAudioRef.current.pause();
    };
  }, []);

  useEffect(() => {
    if (showOverlay === "quiz" && quizPassed) {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.stop();
        console.log("Phaser background music stopped at quiz overlay");
      }
      if (fallbackBackgroundAudioRef.current) {
        fallbackBackgroundAudioRef.current.pause();
        console.log("Fallback background audio stopped at quiz overlay");
      }
    }
  }, [showOverlay, quizPassed]);

  const startGame = () => {
    clearInterval(timerRef.current);
    setGameStarted(true);
    setShowOverlay("");
    setTime(0);
    setScore(1000);
    scoreRef.current = 1000;
    timeRef.current = 0;
    setAudioError(null);
    setImageError(null);
    setIsPaused(false);

    if (Phaser.Sound.WebAudioSoundManager.context) {
      Phaser.Sound.WebAudioSoundManager.context
        .resume()
        .then(() => {
          console.log("Phaser audio context resumed");
          playAudio();
        })
        .catch((error) => {
          console.error("Error resuming Phaser audio context:", error);
          setAudioError("Failed to resume Phaser audio context");
          playFallbackAudio();
        });
    } else {
      console.warn("Phaser audio context not available, using fallback");
      playFallbackAudio();
    }

    timerRef.current = setInterval(() => {
      setTime((prevTime) => {
        const newTime = prevTime + 1;
        timeRef.current = newTime;
        setScore((prevScore) => {
          const newScore = Math.max(
            prevScore - Math.floor(newTime / 10) - 5,
            0
          );
          scoreRef.current = newScore;
          return newScore;
        });
        return newTime;
      });
    }, 1000);
  };

  const playAudio = () => {
    setTimeout(() => {
      try {
        if (introMusicRef.current) {
          introMusicRef.current.play();
          console.log("Phaser intro music playing");
          setTimeout(() => {
            if (introMusicRef.current) {
              introMusicRef.current.stop();
              console.log("Phaser intro music stopped");
            }
            if (backgroundMusicRef.current && showOverlay !== "quiz") {
              backgroundMusicRef.current.play();
              console.log("Phaser background music playing");
            }
          }, 3000);
        } else {
          console.warn(
            "Phaser intro music not available, falling back to HTML5 Audio"
          );
          playFallbackAudio();
        }
      } catch (error) {
        console.error("Error playing Phaser audio:", error);
        setAudioError("Failed to play Phaser audio");
        playFallbackAudio();
      }
    }, 100);
  };

  const playFallbackAudio = () => {
    try {
      if (fallbackIntroAudioRef.current) {
        fallbackIntroAudioRef.current
          .play()
          .then(() => {
            console.log("Playing fallback intro audio");
            setTimeout(() => {
              fallbackIntroAudioRef.current.pause();
              console.log("Fallback intro audio stopped");
              if (
                fallbackBackgroundAudioRef.current &&
                showOverlay !== "quiz"
              ) {
                fallbackBackgroundAudioRef.current
                  .play()
                  .then(() => console.log("Playing fallback background audio"))
                  .catch((error) => {
                    console.error(
                      "Error playing fallback background audio:",
                      error
                    );
                    setAudioError("Failed to play fallback background audio");
                  });
              }
            }, 3000);
          })
          .catch((error) => {
            console.error("Error playing fallback intro audio:", error);
            setAudioError("Failed to play fallback intro audio");
          });
      }
    } catch (error) {
      console.error("Error in fallback audio playback:", error);
      setAudioError("Error in fallback audio playback");
    }
  };

  const playClickSound = () => {
    if (clickSoundRef.current) {
      clickSoundRef.current.currentTime = 0;
      clickSoundRef.current
        .play()
        .catch((error) => {
          console.error("Error playing click sound:", error);
          setAudioError("Failed to play click sound");
        });
    }
  };

  const pauseGame = () => {
    setIsPaused(true);
    setShowOverlay("pause");
    clearInterval(timerRef.current);
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.stop();
      console.log("Phaser background music paused");
    }
    if (fallbackBackgroundAudioRef.current) {
      fallbackBackgroundAudioRef.current.pause();
      console.log("Fallback background audio paused");
    }
  };

  const resumeGame = () => {
    setIsPaused(false);
    setShowOverlay("");
    if (Phaser.Sound.WebAudioSoundManager.context) {
      Phaser.Sound.WebAudioSoundManager.context
        .resume()
        .then(() => {
          if (backgroundMusicRef.current && showOverlay !== "quiz") {
            backgroundMusicRef.current.play();
            console.log("Phaser background music resumed");
          }
        })
        .catch((error) => {
          console.error("Error resuming Phaser audio context:", error);
          setAudioError("Failed to resume Phaser audio context");
          if (fallbackBackgroundAudioRef.current && showOverlay !== "quiz") {
            fallbackBackgroundAudioRef.current
              .play()
              .then(() => console.log("Fallback background audio resumed"))
              .catch((error) => {
                console.error("Error resuming fallback background audio:", error);
                setAudioError("Failed to resume fallback background audio");
              });
          }
        });
    } else {
      if (fallbackBackgroundAudioRef.current && showOverlay !== "quiz") {
        fallbackBackgroundAudioRef.current
          .play()
          .then(() => console.log("Fallback background audio resumed"))
          .catch((error) => {
            console.error("Error resuming fallback background audio:", error);
            setAudioError("Failed to resume fallback background audio");
          });
      }
    }

    timerRef.current = setInterval(() => {
      setTime((prevTime) => {
        const newTime = prevTime + 1;
        timeRef.current = newTime;
        setScore((prevScore) => {
          const newScore = Math.max(
            prevScore - Math.floor(newTime / 10) - 5,
            0
          );
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
    setCodeSubmitted(false);
    setQuizResult("");
    setEditorValue(
      "#include <iostream>\nusing namespace std;\n\nint main() {\n    int x = 5;\n    if (x = 10) { // BUG: Should be == instead of =\n        cout << \"Hello\" << endl;\n    }\n    cout << \"x is not equal to 10\" << endl;\n    return 0;\n}"
    );
    setCodeEditorCode(
      "#include <iostream>\nusing namespace std;\n\nint main() {\n    int x = 5;\n    if (x = 10) { // BUG: Should be == instead of =\n        cout << \"Hello\" << endl;\n    }\n    cout << \"x is not equal to 10\" << endl;\n    return 0;\n}"
    );
    setCodeEditorInput('');
    setCodeEditorOutput('');
    setShowCodeEditor(false);
    if (introMusicRef.current) {
      introMusicRef.current.stop();
      console.log("Phaser intro music stopped on restart");
    }
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.stop();
      console.log("Phaser background music stopped on restart");
    }
    if (fallbackIntroAudioRef.current) {
      fallbackIntroAudioRef.current.pause();
      console.log("Fallback intro audio stopped on restart");
    }
    if (fallbackBackgroundAudioRef.current) {
      fallbackBackgroundAudioRef.current.pause();
      console.log("Fallback background audio stopped on restart");
    }
  };

  const replayGame = () => {
    clearInterval(timerRef.current);
    setGameStarted(true);
    setIsPaused(false);
    setShowOverlay("");
    setTime(0);
    setScore(1000);
    scoreRef.current = 1000;
    timeRef.current = 0;
    setQuizPassed(false);
    setCodeSubmitted(false);
    setQuizResult("");
    setEditorValue(
      "#include <iostream>\nusing namespace std;\n\nint main() {\n    int x = 5;\n    if (x = 10) {       cout << \"Hello\" << endl;\n    }\n    cout << \"x is not equal to 10\" << endl;\n    return 0;\n}"
    );
    setCodeEditorCode(
      "#include <iostream>\nusing namespace std;\n\nint main() {\n    int x = 5;\n    if (x = 10) {       cout << \"Hello\" << endl;\n    }\n    cout << \"x is not equal to 10\" << endl;\n    return 0;\n}"
    );
    setCodeEditorInput('');
    setCodeEditorOutput('');
    setShowCodeEditor(false);
    if (introMusicRef.current) {
      introMusicRef.current.stop();
      console.log("Phaser intro music stopped on replay");
    }
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.stop();
      console.log("Phaser background music stopped on replay");
    }
    if (fallbackIntroAudioRef.current) {
      fallbackIntroAudioRef.current.pause();
      console.log("Fallback intro audio stopped on replay");
    }
    if (fallbackBackgroundAudioRef.current) {
      fallbackBackgroundAudioRef.current.pause();
      console.log("Fallback background audio stopped on replay");
    }
    if (Phaser.Sound.WebAudioSoundManager.context) {
      Phaser.Sound.WebAudioSoundManager.context
        .resume()
        .then(() => {
          console.log("Phaser audio context resumed on replay");
          playAudio();
        })
        .catch((error) => {
          console.error("Error resuming Phaser audio context:", error);
          setAudioError("Failed to resume Phaser audio context");
          playFallbackAudio();
        });
    } else {
      console.warn("Phaser audio context not available, using fallback");
      playFallbackAudio();
    }

    timerRef.current = setInterval(() => {
      setTime((prevTime) => {
        const newTime = prevTime + 1;
        timeRef.current = newTime;
        setScore((prevScore) => {
          const newScore = Math.max(
            prevScore - Math.floor(newTime / 10) - 5,
            0
          );
          scoreRef.current = newScore;
          return newScore;
        });
        return newTime;
      });
    }, 1000);
  };

  const goToNextLevel = () => {
    window.location.href = "/passwordcrack";
  };

  const goBack = () => {
    window.location.href = "/dashboard";
  };

  const submitCode = () => {
    if (editorValue.includes("if (x == 10)")) {
      setCodeSubmitted(true);
      setShowOverlay("outro");
      clearInterval(timerRef.current);
    } else {
      alert("Your code still has errors! Try again.");
      setScore((prevScore) => Math.max(prevScore - 50, 0));
      scoreRef.current = Math.max(scoreRef.current - 50, 0);
    }
  };

  const handleQuizAnswer = (correct) => {
    if (correct) {
      setQuizPassed(true);
      setQuizResult(
        "Correct! The error was: Assignment operator (=) instead of comparison (==)."
      );
      setShowOverlay("rating");
    } else {
      alert("Incorrect, try again!");
      setScore((prevScore) => Math.max(prevScore - 100, 0));
      scoreRef.current = Math.max(scoreRef.current - 100, 0);
    }
  };

  const getStars = () => {
    if (score >= 800) return "⭐⭐⭐";
    if (score >= 400) return "⭐⭐";
    return "⭐";
  };

  const buttonStyle = (color) => ({
    background: `linear-gradient(45deg, ${color}CC, ${color}FF)`,
    border: `4px solid ${color}`,
    color: "#fff",
    padding: "10px 20px",
    margin: "10px",
    borderRadius: "10px",
    fontSize: "clamp(16px, 4vw, 20px)",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "'Orbitron', sans-serif",
    textShadow: `0 0 10px ${color}, 0 0 15px ${color}, 0 0 20px ${color}`,
    boxShadow: `0 0 20px ${color}, 0 0 30px ${color}, 0 0 40px ${color}`,
    transition: "all 0.3s ease",
    width: "40%",
    maxWidth: "300px",
  });

  return (
    <>
      <style>{orbitronStyle}</style>
      <div
        style={{
          backgroundImage: `url(${spaceImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
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
            className="score-timer"
            style={{
              position: "absolute",
              top: "15px",
              left: "15px",
              color: "#00FFFF",
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "clamp(16px, 4vw, 24px)",
              fontWeight: "700",
              textShadow:
                "0 0 10px #00FFFF, 0 0 15px #00FFFF, 0 0 20px #00FFFF",
              zIndex: 3,
              background: "rgba(0, 0, 0, 0.7)",
              padding: "6px 12px",
              borderRadius: "6px",
              border: "2px solid #00FFFF",
              boxShadow: "0 0 15px #00FFFF",
            }}
          >
            🖥️ Score: {score} | ⏱️ Time: {time}s
          </div>
        )}

        {gameStarted && !isPaused && !showOverlay && !codeSubmitted && (
          <button
            onClick={() => {
              playClickSound();
              pauseGame();
            }}
            style={{
              position: "absolute",
              top: "15px",
              right: "15px",
              background: "linear-gradient(45deg, #FFA500CC, #FFA500FF)",
              color: "#fff",
              padding: "6px 12px",
              fontSize: "clamp(14px, 3vw, 18px)",
              fontWeight: "700",
              borderRadius: "6px",
              border: "2px solid #FFA500",
              cursor: "pointer",
              zIndex: 3,
              fontFamily: "'Orbitron', sans-serif",
              textShadow: "0 0 6px #FFA500, 0 0 10px #FFA500",
              boxShadow: "0 0 10px #FFA500, 0 0 15px #FFA500",
              transition: "all 0.3s ease",
            }}
          >
            ⏸️ Pause
          </button>
        )}

        {audioError && (
          <div
            style={{
              position: "absolute",
              top: "60px",
              left: "50%",
              transform: "translateX(-50%)",
              color: "#FF0044",
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "clamp(12px, 3vw, 16px)",
              textShadow: "0 0 8px #FF0044",
              background: "rgba(0, 0, 0, 0.7)",
              padding: "6px 10px",
              borderRadius: "6px",
              zIndex: 3,
            }}
          >
            ⚠️ {audioError}
          </div>
        )}
        {imageError && (
          <div
            style={{
              position: "absolute",
              top: "80px",
              left: "50%",
              transform: "translateX(-50%)",
              color: "#FF0044",
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "clamp(12px, 3vw, 16px)",
              textShadow: "0 0 8px #FF0044",
              background: "rgba(0, 0, 0, 0.7)",
              padding: "6px 10px",
              borderRadius: "6px",
              zIndex: 3,
            }}
          >
            ⚠️ {imageError}
          </div>
        )}

        {showOverlay && (
          <div
            className="overlay"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(50, 0, 100, 0.95))",
              color: "#FF00FF",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2,
              fontFamily: "'Orbitron', sans-serif",
              textAlign: "center",
              padding: "clamp(20px, 5vw, 40px)",
              border: "2px solid #FF00FF",
              boxShadow: "0 0 20px #FF00FF, 0 0 30px #FF00FF",
            }}
          >
            {showOverlay === "intro" && (
              <div>
                <h2
                  style={{
                    color: "#00FFFF",
                    fontSize: "clamp(24px, 6vw, 36px)",
                    textShadow:
                      "0 0 10px #00FFFF, 0 0 15px #00FFFF, 0 0 20px #00FFFF",
                    fontWeight: "700",
                  }}
                >
                  🐞💻 Debug the Code to Save the System! 💾
                </h2>
                <p
                  style={{
                    color: "#E0FF00",
                    fontSize: "clamp(16px, 4vw, 20px)",
                    margin: "15px 0",
                    textShadow: "0 0 8px #E0FF00",
                  }}
                >
                  🛠️ Level {level}: Fix the bug in the code before time runs
                  out! ⏰
                </p>
                {audioError && (
                  <p
                    style={{
                      color: "#FF0044",
                      fontSize: "clamp(12px, 3vw, 16px)",
                      margin: "10px 0",
                      textShadow: "0 0 8px #FF0044",
                    }}
                  >
                    ⚠️ {audioError}
                  </p>
                )}
                {imageError && (
                  <p
                    style={{
                      color: "#FF0044",
                      fontSize: "clamp(12px, 3vw, 16px)",
                      margin: "10px 0",
                      textShadow: "0 0 8px #FF0044",
                    }}
                  >
                    ⚠️ {imageError}
                  </p>
                )}
                <button
                  ref={playButtonRef}
                  onClick={() => {
                    playClickSound();
                    startGame();
                  }}
                  style={buttonStyle("#00FFFF")}
                >
                  🚀 Play Now
                </button>
              </div>
            )}

            {showOverlay === "pause" && (
              <div>
                <h2
                  style={{
                    color: "#FFA500",
                    fontSize: "clamp(24px, 6vw, 36px)",
                    textShadow:
                      "0 0 10px #FFA500, 0 0 15px #FFA500, 0 0 20px #FFA500",
                    fontWeight: "700",
                  }}
                >
                  ⏸️ Game Paused
                </h2>
                <p
                  style={{
                    color: "#E0FF00",
                    fontSize: "clamp(16px, 4vw, 20px)",
                    margin: "15px 0",
                    textShadow: "0 0 8px #E0FF00",
                  }}
                >
                  Choose an option to continue:
                </p>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
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
 window.location.href = '/dashboard'                    }}
                    style={buttonStyle("#FF00FF")}
                  >
                    🔄 Dashboard
                  </button>
                  <button
                    onClick={() => {
                      playClickSound();
                      restartGame();
                    }}
                    style={buttonStyle("#FF4500")}
                  >
                    {BACK_ARROW} Restart
                  </button>
                </div>
              </div>
            )}

            {showOverlay === "outro" && (
              <div>
                <h2
                  style={{
                    color: "#00FF00",
                    fontSize: "clamp(24px, 6vw, 36px)",
                    textShadow:
                      "0 0 10px #00FF00, 0 0 15px #00FF00, 0 0 20px #00FF00",
                    fontWeight: "700",
                  }}
                >
                  ✅ System Saved! 🎉
                </h2>
                <p
                  style={{
                    color: "#E0FF00",
                    fontSize: "clamp(16px, 4vw, 20px)",
                    margin: "15px 0",
                    textShadow: "0 0 8px #E0FF00",
                  }}
                >
                  🏆 You fixed the bug! Ready for a quick quiz? 🧠
                </p>
                <button
                  onClick={() => {
                    playClickSound();
                    setShowOverlay("quiz");
                  }}
                  style={buttonStyle("#00FF00")}
                >
                  📝 Take Quiz
                </button>
              </div>
            )}

            {showOverlay === "quiz" && (
              <div>
                <h2
                  style={{
                    color: "#00FFFF",
                    fontSize: "clamp(24px, 6vw, 36px)",
                    textShadow:
                      "0 0 10px #00FFFF, 0 0 15px #00FFFF, 0 0 20px #00FFFF",
                    fontWeight: "700",
                  }}
                >
                  🧠 Quiz Time! ❓
                </h2>
                <p
                  style={{
                    color: "#E0FF00",
                    fontSize: "clamp(16px, 4vw, 20px)",
                    margin: "15px 0",
                    textShadow: "0 0 8px #E0FF00",
                  }}
                >
                  💡 What was the error in the code?
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
                      ✅ Assignment operator (=) instead of comparison (==)
                    </button>
                    <button
                      onClick={() => {
                        playClickSound();
                        handleQuizAnswer(false);
                      }}
                      style={buttonStyle("#FF0044")}
                    >
                      ❌ Wrong indentation
                    </button>
                  </>
                ) : (
                  <p
                    style={{
                      color: "#00FF00",
                      fontSize: "clamp(16px, 4vw, 20px)",
                      margin: "15px 0",
                      textShadow: "0 0 8px #00FF00",
                    }}
                  >
                    {quizResult}
                  </p>
                )}
              </div>
            )}

            {showOverlay === "rating" && (
              <div>
                <h2
                  style={{
                    color: "#00FFFF",
                    fontSize: "clamp(24px, 6vw, 36px)",
                    textShadow:
                      "0 0 10px #00FFFF, 0 0 15px #00FFFF, 0 0 20px #00FFFF",
                    fontWeight: "700",
                  }}
                >
                  🏆 Level {level} Complete! 🎉
                </h2>
                <p
                  style={{
                    color: "#E0FF00",
                    fontSize: "clamp(16px, 4vw, 20px)",
                    margin: "15px 0",
                    textShadow: "0 0 8px #E0FF00",
                  }}
                >
                  🖥️ Score: {score} / 1000
                </p>
                <p
                  style={{
                    color: "#E0FF00",
                    fontSize: "clamp(16px, 4vw, 20px)",
                    margin: "15px 0",
                    textShadow: "0 0 8px #E0FF00",
                  }}
                >
                  ⏱️ Time Taken: {time} seconds
                </p>
                <p
                  style={{
                    color: "#FFFF00",
                    fontSize: "clamp(18px, 5vw, 24px)",
                    margin: "15px 0",
                    textShadow:
                      "0 0 8px #FFFF00, 0 0 15px #FFFF00, 0 0 20px #FFFF00",
                  }}
                >
                  Rating: {getStars()}
                </p>
                <p
                  style={{
                    color: "#00FF00",
                    fontSize: "clamp(16px, 4vw, 20px)",
                    margin: "15px 0",
                    textShadow: "0 0 8px #00FF00",
                  }}
                >
                  {quizResult}
                </p>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <button
                    onClick={() => {
                      playClickSound();
                      goBack();
                    }}
                    style={buttonStyle("#FF4500")}
                  >
                    {BACK_ARROW} Back
                  </button>
                  <button
                    onClick={() => {
                      playClickSound();
                      restartGame();
                    }}
                    style={buttonStyle("#FF00FF")}
                  >
                    {BACK_ARROW} Restart
                  </button>
                  <button
                    onClick={() => {
                      playClickSound();
                      goToNextLevel();
                    }}
                    style={buttonStyle("#00FF00")}
                  >
                    Next Level {NEXT_ARROW}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {gameStarted && !codeSubmitted && (
          <div
            style={{
              position: "absolute",
              top: "100px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "90vw",
              maxWidth: "1900px",
              color: "#00FFFF",
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "clamp(16px, 4vw, 30px)",
              textAlign: "center",
              textShadow:
                "0 0 8px #00FFFF, 0 0 15px #00FFFF, 0 0 20px #00FFFF",
              background: "rgba(0, 0, 0, 0.7)",
              padding: "10px",
              borderRadius: "8px",
              border: "2px solid #00FFFF",
              boxShadow: "0 0 15px #00FFFF",
              zIndex: 1,
            }}
          >
            🚀 <strong>Mission: Secure the Starship!</strong> The defense
            system is malfunctioning, firing at friendly ships due to a
            buggy condition. Fix the <code>if</code> statement to use{' '}
            <code>==</code> instead of <code>=</code> to correctly compare{' '}
            <code>x</code> to 10, ensuring the system only activates when
            necessary. Save the fleet! 🪐
          </div>
        )}

        <div
          id="game-container"
          style={{
            width: "90vw",
            maxWidth: "720px",
            height: "clamp(50vh, 540px, 75vh)",
            margin: "0 auto",
            backgroundColor: "transparent",
            position: "relative",
            zIndex: 0,
          }}
        />

        {gameStarted && (
          <>
            <AceEditor
              mode="c_cpp"
              theme="monokai"
              value={editorValue}
              onChange={setEditorValue}
              fontSize={"clamp(12px, 3vw, 16px)"}
              width="90vw"
              maxWidth="760px"
              height="clamp(30vh, 260px, 40vh)"
              style={{
                position: "absolute",
                bottom: "100px",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 1,
                borderRadius: "8px",
                border: "2px solid #00FFFF",
                boxShadow: "0 0 20px #00FFFF, 0 0 30px #00FFFF",
                backgroundColor: "rgba(0, 0, 0, 0.8)",
              }}
            />
            {!codeSubmitted && (
              <div style={{ position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)", display: "flex", justifyContent: "center", alignItems: "center", width: "90vw", maxWidth: "760px" }}>
                <button
                  onClick={() => {
                    playClickSound();
                    setShowCodeEditor(true);
                  }}
                  style={{
                    background: "linear-gradient(45deg, #FF00FFCC, #FF00FFFF)",
                    color: "#fff",
                    padding: "10px 20px",
                    fontSize: "clamp(16px, 4vw, 20px)",
                    fontWeight: "700",
                    borderRadius: "10px",
                    border: "2px solid #FF00FF",
                    cursor: "pointer",
                    zIndex: 2,
                    fontFamily: "'Orbitron', sans-serif",
                    textShadow: "0 0 10px #FF00FF, 0 0 15px #FF00FF",
                    boxShadow: "0 0 20px #FF00FF, 0 0 30px #FF00FF",
                    transition: "all 0.3s ease",
                    width: "40%",
                    maxWidth: "300px",
                    marginRight: "10px",
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
                    background: "linear-gradient(45deg, #E0FF00CC, #E0FF00FF)",
                    color: "#000",
                    padding: "10px 20px",
                    fontSize: "clamp(16px, 4vw, 20px)",
                    fontWeight: "700",
                    borderRadius: "10px",
                    border: "2px solid #E0FF00",
                    cursor: "pointer",
                    zIndex: "2",
                    fontFamily: "'Orbitron', sans-serif",
                    textShadow: "0 0 10px #E0FF00, 0 0 15px #E0FF00",
                    boxShadow: "0 0 20px #E0FF00, 0 0 30px #00FF00",
                    transition: "all 0.3s ease",
                    width: "40%",
                    maxWidth: "300px",
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
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              width: "50vw",
              maxWidth: "50%",
              height: "100%",
              background: "rgba(0, 0, 0, 0.9)",
              zIndex: 3,
              padding: "clamp(10px, 2vw, 20px)",
              borderLeft: "2px solid #00FFFF",
              boxShadow: "-5px 0 15px rgba(0, 255, 255, 0.5)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <h3 style={{
                color: "#00FFFF",
                fontFamily: "'Orbitron', sans-serif",
                fontSize: "clamp(16px, 4vw, 24px)",
                textShadow: "0 0 8px #00FFFF",
              }}>
                🧠 Code Testing
              </h3>
              <button
                onClick={() => {
                  playClickSound();
                  setShowCodeEditor(false);
                }}
                style={{
                  background: "linear-gradient(45deg, #FF4500CC, #FF4500FF)",
                  color: "#fff",
                  padding: "8px 16px",
                  fontSize: "clamp(12px, 3vw, 16px)",
                  fontWeight: "700",
                  borderRadius: "6px",
                  border: "2px solid #FF4500",
                  cursor: "pointer",
                  fontFamily: "'Orbitron', sans-serif",
                  textShadow: "0 0 6px #FF4500",
                  boxShadow: "0 0 10px #FF4500",
                }}
              >
                Close
              </button>
            </div>
            <div style={{ flex: 1, overflow: "auto", marginBottom: "10px" }}>
              <CodeMirror
                value={codeEditorCode}
                theme={oneDark}
                height="clamp(30vh, 300px, 50vh)"
                extensions={[cpp()]}
                onChange={(value) => setCodeEditorCode(value)}
                style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', borderRadius: '6px', border: '2px solid #00FFFF' }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label style={{
                color: "#E0FF00",
                fontFamily: "'Orbitron', sans-serif",
                fontSize: "clamp(14px, 3vw, 18px)",
                fontWeight: "700",
                textShadow: "0 0 6px #E0FF00",
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
                  height: "clamp(50px, 10vh, 80px)",
                  background: "rgba(0, 0, 0, 0.8)",
                  color: "#fff",
                  border: "2px solid #00FFFF",
                  borderRadius: "6px",
                  padding: "8px",
                  fontFamily: "monospace",
                  fontSize: "clamp(12px, 2.5vw, 14px)",
                  resize: "none",
                }}
              />
            </div>
            <div style={{ flex: 1, overflow: "auto", background: "rgba(0, 0, 0, 0.8)", borderRadius: "6px", padding: "8px", border: "2px solid #00FFFF" }}>
              <strong style={{
                color: "#E0FF00",
                fontFamily: "'Orbitron', sans-serif",
                fontSize: "clamp(14px, 3vw, 18px)",
                textShadow: "0 0 6px #E0FF00",
              }}>
                🔎 Output:
              </strong>
              <br />
              <pre style={{ color: "#fff", fontSize: "clamp(12px, 2.5vw, 14px)", whiteSpace: "pre-wrap" }}>{codeEditorOutput}</pre>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => {
                playClickSound();
                runCode();
              }}
              style={{
                marginTop: "10px",
                width: "100%",
                padding: "10px",
                background: codeEditorLoading
                  ? "linear-gradient(45deg, #666666CC, #666666FF)"
                  : "linear-gradient(45deg, #00FF00CC, #00FF00FF)",
                color: "#fff",
                fontSize: "clamp(14px, 3vw, 18px)",
                fontWeight: "700",
                borderRadius: "6px",
                border: "2px solid #00FF00",
                cursor: codeEditorLoading ? "not-allowed" : "pointer",
                fontFamily: "'Orbitron', sans-serif",
                textShadow: "0 0 6px #00FF00",
                boxShadow: "0 0 10px #00FF00",
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

export default DebugGame;
