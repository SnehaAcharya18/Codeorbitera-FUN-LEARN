import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import music from "../assets/sounds/leader/b9.mp3"; // Music import at the top

function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleNavigateToCodeAnalyzer = () => {
    window.location.href = "/code-analyzer";
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const url = `${baseUrl}/api/score/leaderboard`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        setLeaderboardData(data.leaderboard || []);
      } catch (err) {
        setError(err.message || "An error occurred while fetching leaderboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-700 flex flex-col">
      {/* Navbar */}
      <nav className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-3 bg-black bg-opacity-40 text-white shadow-md">
        <div className="flex items-center gap-2 mb-2 sm:mb-0">
          <div className="w-8 sm:w-10 h-8 sm:h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white text-base sm:text-lg font-bold font-orbitron">
            C
          </div>
          <span className="text-lg sm:text-xl font-bold font-orbitron">
            Code Orbitera
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => window.location.href = "/dashboard"}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-700 via-indigo-700 to-yellow-500 text-white rounded-lg shadow font-pressStart text-xs sm:text-sm w-full sm:w-auto"
          >
            Dashboard
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => window.location.href = "/Community"}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-700 via-indigo-700 to-yellow-500 text-white rounded-lg shadow font-pressStart text-xs sm:text-sm w-full sm:w-auto"
          >
            Community Forum
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => window.location.href = "/contact"}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-700 via-indigo-700 to-yellow-500 text-white rounded-lg shadow font-pressStart text-xs sm:text-sm w-full sm:w-auto"
          >
            Contact Us
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={handleNavigateToCodeAnalyzer}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-700 via-indigo-700 to-yellow-500 text-white rounded-lg shadow font-pressStart text-xs sm:text-sm w-full sm:w-auto"
          >
            Code Analyzer
          </motion.button>
        </div>
      </nav>

      <div className="flex justify-center items-center flex-grow p-4 sm:p-8">
        <audio autoPlay loop hidden>
          <source src={music} type="audio/mpeg" />
        </audio>
        <div className="bg-gray-900 bg-opacity-95 p-6 sm:p-8 rounded-2xl shadow-2xl max-w-2xl w-full border-2 border-yellow-500 relative overflow-hidden">
          {/* Enhanced overlay for sci-fi effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-800/20 to-black/40 opacity-50 pointer-events-none"></div>
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-yellow-400 tracking-wide drop-shadow-[0_0_8px_rgba(234,179,8,0.9)] animate-pulse border-b-2 border-yellow-500 pb-2 font-orbitron">
              Code Orbitera's Champions
            </h2>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-yellow-400 text-center mb-8 tracking-widest drop-shadow-[0_0_10px_rgba(234,179,8,0.9)] animate-pulse font-orbitron">
            🏆 Leaderboard
          </h1>

          {loading && (
            <p className="text-lg sm:text-xl text-gray-300 text-center animate-pulse font-orbitron">Loading gamer stats...</p>
          )}
          {error && (
            <p className="text-lg sm:text-xl text-red-500 text-center font-semibold font-orbitron">❌ {error}</p>
          )}

          {!loading && !error && leaderboardData.length === 0 && (
            <p className="text-base sm:text-lg text-gray-400 text-center font-orbitron">No survivors yet. Drop in and dominate!</p>
          )}

          {!loading && !error && leaderboardData.length > 0 && (
            <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-500 scrollbar-track-gray-800">
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-yellow-400 text-lg sm:text-xl font-semibold bg-gray-800 bg-opacity-80 rounded-lg shadow-md">
                    <th className="py-3 px-4 sm:px-6 text-center border-b-2 border-yellow-500 font-orbitron">Rank</th>
                    <th className="py-3 px-4 sm:px-6 text-center border-b-2 border-yellow-500 font-orbitron">Player</th>
                    <th className="py-3 px-4 sm:px-6 text-center border-b-2 border-yellow-500 font-orbitron">Scores</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.map((user, index) => (
                    <tr
                      key={user.id}
                      className={`${
                        index === 0
                          ? "bg-yellow-900 bg-opacity-60"
                          : index === 1
                          ? "bg-gray-700 bg-opacity-60"
                          : index === 2
                          ? "bg-gray-600 bg-opacity-60"
                          : "bg-gray-800 bg-opacity-60"
                      } hover:bg-yellow-600 hover:bg-opacity-30 transition-colors duration-300 rounded-lg shadow-md animate-fade-in`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="py-2 px-4 sm:px-6 text-center text-gray-200 text-base sm:text-lg font-medium font-orbitron">
                        {index + 1}
                        {index === 0 && <span className="ml-1 text-lg sm:text-xl">🥇</span>}
                        {index === 1 && <span className="ml-1 text-lg sm:text-xl">🥈</span>}
                        {index === 2 && <span className="ml-1 text-lg sm:text-xl">🥉</span>}
                      </td>
                      <td className="py-2 px-4 sm:px-6 text-center text-gray-200 text-base sm:text-lg font-medium font-orbitron">{user.name}</td>
                      <td className="py-2 px-4 sm:px-6 text-center text-yellow-400 text-base sm:text-lg font-bold font-orbitron">{user.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;