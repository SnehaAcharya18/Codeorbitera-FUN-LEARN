import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ChatBot from "../components/ChatBot";
import { FaWhatsapp, FaInstagram, FaFacebook, FaXTwitter, FaBars } from "react-icons/fa6";
import sadRobot from '../assets/images/level1/sadRobot.jpg';
import wizardImg from '../assets/images/level2/wizard.png';
import door1 from '../assets/images/level3/door1.png';
import doorBlueClosed from '../assets/images/level4/door-blue-closed.png';
import backgroundImage from "../assets/images/level5/oceann.png";
import LabImage from "../assets/images/level7/lab.png"; // Import the local image
import bubble from "../assets/images/level7/bubble.jpg"; // Import the local image
import stack from "../assets/images/midlevel11/b8.png"
import que from "../assets/images/level5/island7.png"
import spaceImage from "../assets/images/hardlevel15/bg12.png";
import bgImage from "../assets/images/hardleveldebug2/bg13.jpg";
import bgImage1 from "../assets/images/hardlast/last.jpg";
import elevatorImg from '../assets/images/hardlevel17/elevator.png';
import last from '../assets/images/dashboard/im.jpg';
import maz from '../assets/images/midlevel2/maz.jpg';
import bay from '../assets/images/dashboard/codingbanner.webp'
import climb from '../assets/images/midlevel2/mai.jpg'
import dsa from '../assets/images/dashboard/im.jpg'

const DashboardPage = () => {
  const { user, logout } = useAuthStore();
  const [selectedDifficulty, setSelectedDifficulty] = useState("easy");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showSocialIcons, setShowSocialIcons] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [scores, setScores] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();

// Replace your slides array with this:
const slides = [
  {
    content: (
      <div className="flex flex-col items-center gap-4">
        <span className="font-orbitron text-lg sm:text-xl md:text-2xl text-center">
          🔥 Master coding through games!
        </span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            console.log("Navigating to CertificatePage with totalScore:", totalScore);
            navigate("/certificate", { state: { totalScore } });
          }}
          className="px-4 py-2 bg-gradient-to-r from-yellow-500 via-orange-400 to-red-500 text-white rounded-lg font-bold shadow font-pressStart text-xs sm:text-sm"
        >
          Get Certificate
        </motion.button>
      </div>
    ),
    image: bay, // oceann.png
  },
  {
    content: (
      <span className="font-orbitron text-lg sm:text-xl md:text-2xl text-center">
        🚀 Climb the leaderboard and earn rewards!
      </span>
    ),
    image: climb, // bg12.png
  },
  {
    content: (
      <span className="font-orbitron text-lg sm:text-xl md:text-2xl text-center">
        🧠 Learn DSA, Debugging, Logic and more!
      </span>
    ),
    image: dsa, // last.jpg
  },
];

  const levels = {
    easy: [
      { name: "Robot charger", image: sadRobot },
      { name: "Variable Voyage", image: wizardImg },
      { name: "Loop Lander", image: door1 },
      { name: "Function Frenzy", image: doorBlueClosed },
      { name: "Island Adventure", image: backgroundImage},
    ],
    medium: [
      { name: "Bubble Blaster", image: bubble },
      { name: "Maze Master", image: maz },
      { name: "Queue Quest", image: que },
      { name: "Insertion Invasion", image: LabImage },
      { name: "Stack Smasher", image: stack },
    ],
    hard: [
      { name: "Debug Duel", image: bgImage },
      { name: "Password Puzzle", image: last },
      { name: "Code Cracker", image: bgImage1},
      { name: "Elevator Escape", image: elevatorImg },
      { name: "Syntax Showdown", image: spaceImage },
    ],
  };

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const email = user?.email?.trim()?.toLowerCase();
        if (!email) {
          console.error("No email found for user");
          return;
        }
        console.log("Fetching scores for email:", email);
        const res = await axios.get(`http://localhost:5000/api/score/by-email/${email}`);
        const scores = res.data.gameScores || {};
        const total = Object.values(scores).reduce((sum, val) => sum + Number(val || 0), 0);
        setScores(scores);
        setTotalScore(total);
      } catch (err) {
        console.error("Failed to fetch scores:", err.response?.data || err.message);
      }
    };

    if (user?.email) {
      fetchScores();
    }
  }, [user?.email]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const handleLogout = () => {
    logout();
  };

  const handleDifficultyChange = (difficulty) => {
    setSelectedDifficulty(difficulty);
  };

  const handlePlayNow = (levelName) => {
  const routes = {
    easy: {
      "Robot charger": "/RobotChargingGame",
      "Variable Voyage": "/LearningGame",
      "Loop Lander": "/Messenger",
      "Function Frenzy": "/LogicGame",
      "Island Adventure": "/BridgeGame",
    },
    medium: {
      "Bubble Blaster": "/BubbleSort",
      "Maze Master": "/MazeGame",
      "Queue Quest": "/FifoGame",
      "Insertion Invasion": "/InsertionGame",
      "Stack Smasher": "/LifoGame",
    },
    hard: {
      "Debug Duel": "/DebugGame",
      "Password Puzzle": "/passwordcrack",
      "Code Cracker": "/DebuggerGame",
      "Elevator Escape": "/elevater",
      "Syntax Showdown": "/DebuggingGameApp",
    },
  };

  const path = routes[selectedDifficulty]?.[levelName];
  if (path) {
    navigate(path, { state: { totalScore } });
  } else {
    console.error(`No route found for level: ${levelName} in difficulty: ${selectedDifficulty}`);
  }
};

  const handleNavigateToCodeAnalyzer = () => {
    navigate("/Codeanalyser");
  };

  const handleNavigateToLeaderboard = () => {
    navigate("/leaderboard");
  };

  const handleNavigateToDashboard = () => {
    navigate("/Dashboarduser");
  };

  return (
    <div className="fixed top-0 left-0 w-full h-[100dvh] flex flex-col bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Hamburger Menu for Mobile */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 text-white text-2xl"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <FaBars />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-[100dvh] w-64 text-white flex flex-col bg-gradient-to-b from-purple-900 via-slate-900 to-purple-900 z-40 transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 sm:p-6 space-y-6 flex-grow">
          <div>
            <h2 className="text-lg sm:text-xl font-bold mb-2 font-orbitron">👤 Player Profile</h2>
            <div className="bg-black bg-opacity-30 rounded-lg p-4">
              <p>
                <span className="text-yellow-400 font-semibold font-orbitron">Name:</span>{" "}
                {user?.name || "N/A"}
              </p>
              <p>
                <span className="text-yellow-400 font-semibold font-orbitron">Total Score:</span>{" "}
                {totalScore} points
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowSocialIcons(!showSocialIcons)}
              className="w-full py-2 text-white font-semibold rounded-lg shadow bg-gradient-to-r from-slate-700 via-purple-800 to-yellow-500 font-pressStart text-xs sm:text-sm"
            >
              Invite People
            </motion.button>

            {showSocialIcons && (
              <div className="flex justify-around items-center text-lg sm:text-xl text-white mt-2">
                <button
                  title="WhatsApp"
                  onClick={() => window.open("https://wa.me/?text=Join%20me%20on%20Code%20Orbitera!", "_blank")}
                >
                  <FaWhatsapp />
                </button>
                <button
                  title="Instagram"
                  onClick={() => window.open("https://www.instagram.com/", "_blank")}
                >
                  <FaInstagram />
                </button>
                <button
                  title="Facebook"
                  onClick={() => window.open("https://www.facebook.com/", "_blank")}
                >
                  <FaFacebook />
                </button>
                <button
                  title="X"
                  onClick={() => window.open("https://twitter.com/", "_blank")}
                >
                  <FaXTwitter />
                </button>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleNavigateToLeaderboard}
              className="w-full py-2 text-white font-semibold rounded-lg shadow bg-gradient-to-r from-slate-700 via-purple-800 to-yellow-500 font-pressStart text-xs sm:text-sm"
            >
              Leaderboard
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleNavigateToDashboard}
              className="w-full py-2 text-white font-semibold rounded-lg shadow bg-gradient-to-r from-slate-700 via-purple-800 to-yellow-500 font-pressStart text-xs sm:text-sm"
            >
              Dashboard
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="mt-8 py-2 w-full text-white font-bold rounded-lg shadow bg-gradient-to-r from-red-600 via-red-500 to-yellow-400 font-pressStart text-xs sm:text-sm"
          >
            Logout
          </motion.button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-grow overflow-y-auto bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 pb-20 transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-64" : "ml-0 lg:ml-64"
        }`}
      >
        {/* Top Navbar */}
        <nav className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-4 bg-black bg-opacity-40 text-white shadow">
          <div className="flex items-center gap-2 mb-2 sm:mb-0">
            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white text-base sm:text-lg font-bold font-orbitron">
              C
            </div>
            <span className="text-lg sm:text-xl font-bold font-orbitron">Code Orbitera</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate("/Community")}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-slate-700 via-purple-800 to-yellow-500 text-white rounded shadow font-pressStart text-2xl sm:text-lg font-bold"
            >
              Community Forum
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate("/contact")}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-slate-700 via-purple-800 to-yellow-500 text-white rounded shadow font-pressStart text-xs sm:text-lg font-bold"
            >
              Contact Us
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleNavigateToCodeAnalyzer}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-slate-700 via-purple-800 to-yellow-500 text-white rounded shadow font-pressStart text-xs sm:text-lg font-bold"
            >
              Code Analyzer
            </motion.button>
          </div>
        </nav>

        {/* Slide Banner */}
        <div
          className="flex justify-center items-center h-60 sm:h-72 text-white text-lg md:text-2xl font-semibold bg-cover bg-center relative"
          style={{
            backgroundImage: `url(${slides[currentSlide].image})`,
            backgroundSize: "cover", // Ensures the image fits perfectly
            backgroundPosition: "center", // Centers the image
          }}
        >
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>

          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6 }}
            className="text-center px-4 relative z-10"
          >
            {slides[currentSlide].content}
          </motion.div>
        </div>

        {/* Difficulty Selector */}
        <div className="flex justify-center gap-2 sm:gap-4 py-4 sm:py-6 bg-black bg-opacity-20">
          {["easy", "medium", "hard"].map((difficulty) => (
            <button
              key={difficulty}
              onClick={() => handleDifficultyChange(difficulty)}
              className={`px-4 sm:px-6 py-1.5 sm:py-2 text-white rounded-full transition-all duration-200 font-pressStart text-xs sm:text-sm ${
                selectedDifficulty === difficulty
                  ? "bg-gradient-to-r from-yellow-500 via-orange-400 to-red-500 font-bold shadow"
                  : "bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-500 hover:from-zinc-600 hover:to-zinc-400"
              }`}
            >
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </button>
          ))}
        </div>

        {/* Levels Section */}
        <div className="px-4 sm:px-6 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {levels[selectedDifficulty].map((level, index) => (
            <motion.div
              key={level.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-black bg-opacity-30 rounded-lg p-4 sm:p-5 shadow-lg text-white"
            >
              <h3 className="text-base sm:text-lg font-semibold text-yellow-400 mb-2 font-orbitron">
                {level.name}
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={level.image}
                  alt={`${level.name} icon`}
                  className="w-12 h-12 rounded-md object-cover"
                />
                <p className="text-gray-300 text-xs sm:text-sm flex-1">
                  Exciting coding challenge to boost your skills.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePlayNow(level.name)}
                className="mt-4 py-1.5 sm:py-2 px-3 sm:px-4 bg-gradient-to-r from-yellow-500 via-orange-400 to-red-500 text-white rounded-lg font-bold shadow font-pressStart text-xs sm:text-sm"
              >
                Play Now
              </motion.button>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Chatbot Toggle */}
      <motion.button
        className="fixed bottom-24 right-4 sm:right-6 w-12 sm:w-14 h-12 sm:h-14 rounded-full bg-gradient-to-r from-yellow-500 via-orange-400 to-red-500 text-white text-lg sm:text-xl shadow-lg z-50 flex items-center justify-center hover:bg-yellow-600"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowChatbot(!showChatbot)}
      >
        💬
      </motion.button>

      {/* Chatbot */}
      {showChatbot && <ChatBot />}

      {/* Footer */}
      <footer
        className={`mt-auto bg-black bg-opacity-40 text-center text-white py-3 text-xs sm:text-sm shadow-inner z-40 font-pressStart transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-64" : "ml-0 lg:ml-64"
        }`}
      >
        © 2025 Code Orbitera. All Rights Reserved.
      </footer>
    </div>
  );
};

export default DashboardPage;