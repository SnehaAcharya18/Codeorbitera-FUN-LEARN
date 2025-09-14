import { useState, useMemo, useEffect, useRef } from "react";
import axios from "axios";
import backgroundImg from '../../assets/images/midlevel2/bl.jpg';
import backgroundMusic from '../../assets/sounds/midlevel2/bg1.mp3';

// Define postScore function
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

const generateMaze = (x, y) => {
  const totalCells = x * y;
  const maze = [];
  const unvisited = [];
  for (let i = 0; i < y; i++) {
    maze[i] = [];
    unvisited[i] = [];
    for (let j = 0; j < x; j++) {
      maze[i][j] = [0, 0, 0, 0];
      unvisited[i][j] = true;
    }
  }

  let currentCell = [
    Math.floor(Math.random() * y),
    Math.floor(Math.random() * x)
  ];
  const path = [currentCell];
  unvisited[currentCell[0]][currentCell[1]] = false;
  let visited = 1;

  while (visited < totalCells) {
    const pot = [
      [currentCell[0] - 1, currentCell[1], 0, 2],
      [currentCell[0], currentCell[1] + 1, 1, 3],
      [currentCell[0] + 1, currentCell[1], 2, 0],
      [currentCell[0], currentCell[1] - 1, 3, 1]
    ];
    const neighbors = [];

    for (let l = 0; l < 4; l++) {
      if (
        pot[l][0] > -1 &&
        pot[l][0] < y &&
        pot[l][1] > -1 &&
        pot[l][1] < x &&
        unvisited[pot[l][0]][pot[l][1]]
      ) {
        neighbors.push(pot[l]);
      }
    }

    if (neighbors.length) {
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      maze[currentCell[0]][currentCell[1]][next[2]] = 1;
      maze[next[0]][next[1]][next[3]] = 1;
      unvisited[next[0]][next[1]] = false;
      visited++;
      currentCell = [next[0], next[1]];
      path.push(currentCell);
    } else {
      currentCell = path.pop();
    }
  }
  return maze;
};

const getOptions = (x, y, maze, visited) => {
  const options = [];
  const cell = maze[x][y];
  const rows = maze.length;
  const cols = maze[0].length;

  if (x + 1 < rows && !visited[x + 1][y] && cell[2] === 1) {
    options.push([x + 1, y]);
  }
  if (y + 1 < cols && !visited[x][y + 1] && cell[1] === 1) {
    options.push([x, y + 1]);
  }
  if (y - 1 >= 0 && !visited[x][y - 1] && cell[3] === 1) {
    options.push([x, y - 1]);
  }
  if (x - 1 >= 0 && !visited[x - 1][y] && cell[0] === 1) {
    options.push([x - 1, y]);
  }

  return options;
};

const solveBFS = (
  maze,
  startX = 0,
  startY = 0,
  endX = maze.length - 1,
  endY = maze[0].length - 1
) => {
  const rows = maze.length;
  const cols = maze[0].length;
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const queue = [[startX, startY, [[startX, startY]]]];
  visited[startX][startY] = true;

  while (queue.length > 0) {
    const [x, y, path] = queue.shift();
    if (x === endX && y === endY) {
      return path;
    }

    const cell = maze[x][y];
    const directions = [
      [x - 1, y, 0],
      [x, y + 1, 1],
      [x + 1, y, 2],
      [x, y - 1, 3]
    ];

    for (const [nx, ny, dir] of directions) {
      if (nx >= 0 && nx < rows && ny >= 0 && ny < cols && !visited[nx][ny] && cell[dir] === 1) {
        visited[nx][ny] = true;
        queue.push([nx, ny, [...path, [nx, ny]]]);
      }
    }
  }

  return [];
};

const shortestPathLengthBFS = (maze) => {
  const rows = maze.length;
  const cols = maze[0].length;
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const queue = [[0, 0, 0]];
  visited[0][0] = true;

  while (queue.length > 0) {
    const [x, y, steps] = queue.shift();
    if (x === rows - 1 && y === cols - 1) {
      return steps + 1;
    }

    const cell = maze[x][y];
    const directions = [
      [x - 1, y, 0],
      [x, y + 1, 1],
      [x + 1, y, 2],
      [x, y - 1, 3]
    ];

    for (const [nx, ny, dir] of directions) {
      if (nx >= 0 && nx < rows && ny >= 0 && ny < cols && !visited[nx][ny] && cell[dir] === 1) {
        visited[nx][ny] = true;
        queue.push([nx, ny, steps + 1]);
      }
    }
  }

  return -1;
};

const MazeGame = () => {
  const [gameId, setGameId] = useState(1);
  const [status, setStatus] = useState("intro");
  const [cheatMode, setCheatMode] = useState(false);
  const [userPosition, setUserPosition] = useState([0, 0]);
  const [time, setTime] = useState(0);
  const [moves, setMoves] = useState(0);
  const [playerPath, setPlayerPath] = useState([[0, 0]]);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const appRef = useRef(null);
  const mazeContainerRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const SIZE = 12;

  const maze = useMemo(() => generateMaze(SIZE, SIZE), [gameId]);
  const bfsSolution = useMemo(() => {
    const solutionPath = solveBFS(maze);
    const s = new Set();
    solutionPath.forEach((path) => {
      const [x, y] = path;
      s.add(String(x) + "-" + String(y));
    });
    return { set: s, length: solutionPath.length };
  }, [maze]);
  const bfsLength = useMemo(() => shortestPathLengthBFS(maze), [maze]);

  const calculateGameScore = () => {
    const optimalMoves = bfsLength;
    const moveScore = Math.max(0, Math.round((optimalMoves / moves) * 100));
    const timeScore = Math.max(0, Math.round((optimalMoves * 5 / time) * 100));
    return Math.round((moveScore + timeScore) / 2);
  };

  const getPathStyle = () => {
    if (moves === bfsLength - 1) {
      return "BFS-like (optimal shortest path)";
    } else {
      return "Custom exploration path (longer than optimal)";
    }
  };

  const makeClassName = (i, j) => {
    const rows = maze.length;
    const cols = maze[0].length;
    let arr = [];
    if (maze[i][j][0] === 0) {
      arr.push("topWall");
    }
    if (maze[i][j][1] === 0) {
      arr.push("rightWall");
    }
    if (maze[i][j][2] === 0) {
      arr.push("bottomWall");
    }
    if (maze[i][j][3] === 0) {
      arr.push("leftWall");
    }
    if (i === rows - 1 && j === cols - 1) {
      arr.push("destination");
    }
    if (i === userPosition[0] && j === userPosition[1]) {
      arr.push("currentPosition");
    }
    if (cheatMode && bfsSolution.set.has(String(i) + "-" + String(j))) {
      arr.push("sol");
    }
    return arr.join(" ");
  };

  const quizScore = quizAnswer === "BFS" ? 100 : 0;
  const finalScore = status === "final" ? Math.round((calculateGameScore() + quizScore) / 2) : 0;
  const finalStars = finalScore >= 90 ? 3 : finalScore >= 70 ? 2 : 1;

  useEffect(() => {
    if (status === "playing" && !paused) {
      timerRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
      if (audioRef.current) {
        audioRef.current.play().catch((error) => {
          console.error("Audio playback failed:", error);
        });
      }
    } else {
      clearInterval(timerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
    return () => {
      clearInterval(timerRef.current);
    };
  }, [status, paused]);

  useEffect(() => {
    if (status === "final") {
      postScore("MazeSolver", finalScore);
    }
  }, [status, finalScore]);

  useEffect(() => {
    const lastRowIndex = maze.length - 1;
    const lastColIndex = maze[0].length - 1;
    if (userPosition[0] === lastRowIndex && userPosition[1] === lastColIndex) {
      setStatus("explanation");
      clearInterval(timerRef.current);
    }
  }, [userPosition]);

  const move = (di, dj, dirIndex) => {
    if (status !== "playing" || paused) return;
    const [i, j] = userPosition;
    if (maze[i][j][dirIndex] === 1) {
      const newPos = [i + di, j + dj];
      setUserPosition(newPos);
      setPlayerPath(prev => [...prev, newPos]);
      setMoves(prev => prev + 1);
    }
  };

  // Handle touch events for swipe gestures
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e) => {
    if (status !== "playing" || paused) return;
    const touch = e.changedTouches[0];
    const touchEnd = { x: touch.clientX, y: touch.clientY };
    const dx = touchEnd.x - touchStartRef.current.x;
    const dy = touchEnd.y - touchStartRef.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Determine swipe direction based on the largest movement
    if (absDx > absDy && absDx > 30) {
      // Horizontal swipe
      if (dx > 0) {
        move(0, 1, 1); // Swipe right
      } else {
        move(0, -1, 3); // Swipe left
      }
    } else if (absDy > 30) {
      // Vertical swipe
      if (dy > 0) {
        move(1, 0, 2); // Swipe down
      } else {
        move(-1, 0, 0); // Swipe up
      }
    }
  };

  const handleStartGame = () => {
    setPaused(false);
    setUserPosition([0, 0]);
    setPlayerPath([[0, 0]]);
    setStatus("playing");
    setGameId(gameId + 1);
    setTime(0);
    setMoves(0);
    setQuizAnswer(null);
    setCheatMode(false);
  };

  const handleReplay = () => {
    setPaused(false);
    handleStartGame();
  };

  const handleNextLevel = () => {
    window.location.href = '/FifoGame';
  };

  const handleDashboard = () => {
    window.location.href = '/dashboard';
  };

  const handleQuiz = (answer) => {
    setQuizAnswer(answer);
    setStatus("final");
  };

  return (
    <div
      className="App"
      tabIndex={-1}
      ref={appRef}
      onKeyDown={(e) => {
        if (status !== "playing" || paused) return;
        const key = e.code;
        if (key === "ArrowUp" || key === "KeyW") move(-1, 0, 0);
        if (key === "ArrowRight" || key === "KeyD") move(0, 1, 1);
        if (key === "ArrowDown" || key === "KeyS") move(1, 0, 2);
        if (key === "ArrowLeft" || key === "KeyA") move(0, -1, 3);
      }}
    >
      <audio ref={audioRef} src={backgroundMusic} loop />
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');

          html, body, #root {
            height: 100vh;
            margin: 0;
            padding: 0;
            overflow: auto;
            font-family: 'Orbitron', sans-serif;
            background-color: #000;
            touch-action: manipulation; /* Prevent default touch behaviors like zooming */
          }

          .App {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            min-height: 100vh;
            width: 100vw;
            padding: clamp(5px, 2vw, 10px);
            background-image: url(${backgroundImg});
            background-size: cover;
            background-position: center;
            color: #00ffcc;
            text-shadow: 0 0 5px #00ffcc, 0 0 10px #00ffcc;
            box-sizing: border-box;
            -webkit-user-select: none; /* Prevent text selection on mobile */
            user-select: none;
          }

          .game-header {
            font-size: clamp(40px, 10vw, 60px);
            color: #ffffff;
            margin: clamp(5px, 2vw, 10px) 0;
            font-weight: 700;
            text-align: center;
            text-shadow: 0 0 10px #ffffff, 0 0 20px #ffffff, 0 0 30px #ffffff;
            position: relative;
            z-index: 10;
          }

          .intro, .explanation, .quiz, .final, .dashboard {
            text-align: center;
            width: 100%;
            max-width: clamp(300px, 90vw, 900px);
            background: rgba(0, 0, 0, 0.8);
            padding: clamp(20px, 5vw, 40px);
            border-radius: 10px;
            box-shadow: 0 0 15px #00ffcc;
            margin-bottom: clamp(5px, 2vw, 10px);
            height: fit-content;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }

          .intro h1, .explanation p:first-child, .quiz p:first-child, .final p:first-child, .dashboard p:first-child {
            font-size: clamp(20px, 5vw, 25px);
            color: #ff00ff;
            margin-bottom: clamp(5px, 2vw, 10px);
            font-weight: 700;
            text-shadow: 0 0 10px #ff00ff;
          }

          .intro p, .explanation p, .quiz p, .final p, .dashboard p {
            font-size: clamp(20px, 5vw, 30px);
            color: #00ffcc;
            line-height: 1.4;
            margin-bottom: clamp(5px, 2vw, 10px);
            text-shadow: 0 0 5px #00ffcc;
          }

          .game-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            width: 100%;
            max-width: clamp(300px, 90vw, 800px);
            padding: clamp(5px, 2vw, 8px);
            background: rgba(0, 0, 0, 0.8);
            border-radius: 8px;
            box-shadow: 0 0 10px #00ff00;
            margin-bottom: clamp(3px, 1vw, 5px);
            font-size: clamp(20px, 5vw, 25px);
            color: #00ff00;
            text-shadow: 0 0 5px #00ff00;
          }

          .game-container {
            display: flex;
            flex-wrap: wrap;
            gap: clamp(10px, 3vw, 20px);
            width: 100%;
            max-width: clamp(300px, 95vw, 1000px);
            margin-top: 0;
            align-items: center;
            justify-content: center;
          }

          .maze-container {
            padding: 2px;
            background: rgba(0, 0, 0, 0.8);
            border-radius: 10px;
            border: 3px solid #00ffcc;
            box-shadow: 0 0 15px #00ffcc;
            width: clamp(200px, 80vw, 500px);
            height: clamp(200px, 80vw, 500px);
            aspect-ratio: 1 / 1;
            touch-action: none; /* Prevent default touch behaviors on maze */
          }

          .sidebar {
            display: flex;
            flex-direction: column;
            gap: clamp(5px, 2vw, 10px);
            padding: clamp(10px, 3vw, 15px);
            background: rgba(0, 0, 0, 0.8);
            border-radius: 10px;
            border: 3px solid #00ff00;
            box-shadow: 0 0 15px #00ff00;
            align-items: center;
            width: clamp(200px, 80vw, 400px);
          }

          .sidebar label {
            font-size: clamp(20px, 5vw, 25px);
            font-weight: 700;
            color: #ff00ff;
            text-shadow: 0 0 5px #ff00ff;
            margin: 0;
          }

          .sidebar input[type="checkbox"] {
            width: clamp(16px, 4vw, 18px);
            height: clamp(16px, 4vw, 18px);
            margin-right: clamp(5px, 2vw, 8px);
            margin-left: clamp(5px, 2vw, 8px);
            vertical-align: middle;
            accent-color: #00ff00;
          }

          .cheat-mode-container {
            display: flex;
            align-items: center;
            gap: clamp(5px, 2vw, 8px);
            margin-top: clamp(5px, 2vw, 10px);
          }

          .button {
            padding: clamp(8px, 2vw, 12px) 0;
            border: 2px solid #00ffcc;
            border-radius: 4px;
            color: #00ffcc;
            font-size: clamp(16px, 4vw, 20px);
            font-weight: 700;
            cursor: pointer;
            background-color: transparent;
            transition: all 0.3s ease;
            text-align: center;
            width: 100%;
            box-sizing: border-box;
            text-shadow: 0; /* Removed text-shadow for better readability on mobile */
            min-height: 44px;
            touch-action: manipulation;
          }

          .pbutton {
            padding: clamp(8px, 2vw, 12px) 0;
            border: 2px solid #00ffcc;
            border-radius: 4px;
            color: #00ffcc;
            font-size: clamp(16px, 4vw, 20px);
            font-weight: 700;
            cursor: pointer;
            background-color: transparent;
            transition: all 0.3s ease;
            text-align: center;
            box-sizing: border-box;
            text-shadow: 0; /* Removed text-shadow for better readability on mobile */
            min-height: 44px;
            width: clamp(100px, 30vw, 150px);
            touch-action: manipulation;
          }

          .button:hover, .pbutton:hover {
            background-color: #00ffcc;
            color: #000;
            box-shadow: 0 0 15px #00ffcc;
          }

          .button:active, .pbutton:active {
            background-color: #00ccaa;
            transform: scale(0.95); /* Slight scale down on tap for feedback */
          }

          p.instructions {
            font-size: clamp(20px, 5vw, 25px);
            color: #ff00ff;
            margin: clamp(5px, 2vw, 10px) 0;
            text-shadow: 0 0 5px #ff00ff;
            max-width: clamp(300px, 80vw, 500px);
          }

          #maze {
            border-collapse: collapse;
            background: transparent;
            width: 100%;
            height: 100%;
          }

          #maze td {
            height: calc(100% / 12);
            width: calc(100% / 12);
            position: relative;
          }

          .topWall {
            border-top: clamp(4px, 1vw, 7px) solid #00ffff;
          }

          .rightWall {
            border-right: clamp(4px, 1vw, 7px) solid #00ffff;
          }

          .bottomWall {
            border-bottom: clamp(4px, 1vw, 7px) solid #00ffff;
          }

          .leftWall {
            border-left: clamp(4px, 1vw, 7px) solid #00ffff;
          }

          .sol div {
            height: 50%;
            width: 50%;
            border-radius: 50%;
            background: #ffff00;
            display: inline-block;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            box-shadow: 0 0 15px #ffff00, 0 0 25px #ffff00;
          }

          .currentPosition div {
            background: #ff00ff;
            height: 80%;
            width: 80%;
            border-radius: 50%;
            display: block;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            box-shadow: 0 0 20px #ff00ff, 0 0 30px #ff00ff;
          }

          .destination div {
            background: #00ff00;
            height: 80%;
            width: 80%;
            border-radius: 50%;
            display: block;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            box-shadow: 0 0 20px #00ff00, 0 0 30px #00ff00;
          }

          .stars {
            font-size: clamp(30px, 8vw, 50px);
            color: #ffff00;
            margin: clamp(5px, 2vw, 10px) 0;
            text-shadow: 0 0 10px #ffff00;
          }

          .pause-menu {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            padding: clamp(20px, 5vw, 40px);
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 0 20px #00ffcc;
            z-index: 100;
            width: clamp(250px, 80vw, 400px);
          }

          .pause-menu h2 {
            font-size: clamp(30px, 8vw, 40px);
            margin-bottom: clamp(10px, 3vw, 20px);
            color: #ff00ff;
            text-shadow: 0 0 10px #ff00ff;
          }

          @media (max-width: 768px) {
            .game-container {
              flex-direction: column;
            }
            .maze-container {
              order: 1;
              width: clamp(200px, 90vw, 400px); /* Smaller maze on mobile */
              height: clamp(200px, 90vw, 400px);
            }
            .sidebar {
              order: 2;
              width: clamp(200px, 90vw, 400px);
            }
            .game-info {
              flex-direction: column;
              align-items: center;
              gap: clamp(5px, 2vw, 10px);
            }
            .topWall, .rightWall, .bottomWall, .leftWall {
              border-width: clamp(2px, 0.8vw, 4px); /* Thinner walls on mobile */
            }
            .currentPosition div, .destination div {
              height: 70%; /* Slightly smaller player/destination on mobile */
              width: 70%;
            }
            .sol div {
              height: 40%;
              width: 40%;
            }
            p.instructions {
              font-size: clamp(16px, 4vw, 20px);
            }
          }

          @media (max-width: 480px) {
            .game-header {
              font-size: clamp(30px, 8vw, 40px);
            }
            .button, .pbutton {
              font-size: clamp(14px, 4vw, 16px);
              padding: clamp(6px, 2vw, 10px);
              min-height: 40px;
            }
            .maze-container {
              width: clamp(180px, 85vw, 350px);
              height: clamp(180px, 85vw, 350px);
            }
          }
        `}
      </style>

      <h1 className="game-header">Maze Solver</h1>

      {status === "intro" && (
        <div className="intro">
          <h1>Welcome to Maze Solver</h1>
          <p>
            Navigate a 12x12 maze as a rogue AI. Reach the core to escape! Swipe on the maze to move.
          </p>
          <button className="button start" onClick={handleStartGame}>Start Game</button>
        </div>
      )}

      {status === "playing" && (
        <>
          <div className="game-info">
            <span>
              Time: {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, "0")}
            </span>
            <span>Moves: {moves}</span>
            <button className="pbutton" onClick={() => setPaused(true)}>⏸ Pause</button>
          </div>

          <div className="game-container">
            <div
              className="maze-container"
              ref={mazeContainerRef}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <table id="maze">
                <tbody>
                  {maze.map((row, i) => (
                    <tr key={`row-${i}`}>
                      {row.map((cell, j) => (
                        <td key={`cell-${i}-${j}`} className={makeClassName(i, j)}>
                          <div />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="sidebar">
              <p className="instructions">Swipe on maze or use buttons/WSAD</p>
              <button className="button" onClick={() => move(-1, 0, 0)}>Up</button>
              <button className="button" onClick={() => move(1, 0, 2)}>Down</button>
              <button className="button" onClick={() => move(0, -1, 3)}>Left</button>
              <button className="button" onClick={() => move(0, 1, 1)}>Right</button>
              <button className="button" onClick={handleReplay}>Restart</button>
              <div className="cheat-mode-container">
                <input
                  type="checkbox"
                  id="cheatMode"
                  name="cheatMode"
                  onChange={(e) => setCheatMode(e.target.checked)}
                />
                <label htmlFor="cheatMode">Cheat Mode (BFS)</label>
              </div>
            </div>
          </div>
        </>
      )}

      {paused && status === "playing" && (
        <div className="pause-menu">
          <h2>⏸ Game Paused</h2>
          <button className="button" onClick={() => setPaused(false)}>▶ Resume</button>
          <button className="button" onClick={handleReplay}>🔄 Restart</button>
          <button className="button" onClick={handleDashboard}>🏠 Dashboard</button>
        </div>
      )}

      {status === "explanation" && (
        <div className="explanation">
          <p><strong>Victory!</strong> You completed the maze.</p>
          <p>Your route: {getPathStyle()}</p>
          <p>DFS explores deeply, backtracking when stuck, often taking longer paths.</p>
          <p>BFS searches level by level, ensuring the shortest path.</p>
          <p>BFS is ideal for maze solving due to its efficiency.</p>
          <button className="button quiz" onClick={() => setStatus("quiz")}>Take Quiz</button>
        </div>
      )}

      {status === "quiz" && (
        <div className="quiz">
          <p><strong>Quiz:</strong> Best algorithm for shortest maze path?</p>
          <button className="button" onClick={() => handleQuiz("DFS")}>DFS</button>
          <button className="button" onClick={() => handleQuiz("BFS")}>BFS</button>
        </div>
      )}

      {status === "final" && (
        <div className="final">
          <p><strong>Final Results</strong></p>
          <div className="stars">
            {"★".repeat(finalStars) + "☆".repeat(3 - finalStars)}
          </div>
          <p>Game Score: {calculateGameScore()}</p>
          <p>Quiz Score: {quizScore}</p>
          <p>Total Score: {finalScore}</p>
          <button className="button next" onClick={handleNextLevel}>Next Level</button>
          <button className="button dashboard" onClick={handleDashboard}>Dashboard</button>
          <button className="button replay" onClick={handleReplay}>Replay</button>
        </div>
      )}

      {status === "dashboard" && (
        <div className="dashboard">
          <p><strong>Dashboard</strong></p>
          <p>Latest Score: {finalScore}/100</p>
          <p>Stars: {"★".repeat(finalStars) + "☆".repeat(3 - finalStars)}</p>
          <button className="button start" onClick={() => setStatus("intro")}>Back to Start</button>
        </div>
      )}
    </div>
  );
};

export default MazeGame;