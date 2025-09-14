import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const DashboardUser = () => {
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const [data, setData] = useState({
    username: "Player",
    weeklyScores: [],
    totalScore: 0,
    completedLevels: 0,
    accuracy: 0,
    streak: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/api/score/user-dashboard`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data (${response.status})`);
      }

      const json = await response.json();
      setData(json);
    } catch (err) {
      setError(err.message || "Error fetching dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, []);

  // Render chart when weeklyScores changes
  useEffect(() => {
    if (!data.weeklyScores || !data.weeklyScores.length || !chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Score",
            data: data.weeklyScores,
            borderColor: "#8b5cf6",
            backgroundColor: "rgba(139, 92, 246, 0.2)",
            borderWidth: 3,
            tension: 0.3,
            pointRadius: 5,
            pointBackgroundColor: "#8b5cf6",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: "#e5e7eb" } } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: "#e5e7eb" },
            grid: { color: "rgba(255,255,255,0.1)" },
          },
          x: {
            ticks: { color: "#e5e7eb" },
            grid: { display: false },
          },
        },
      },
    });
  }, [data.weeklyScores]);

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-b from-gray-900 to-black text-white overflow-hidden">
      {/* 🔹 Navbar */}
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
          {[
            { label: "Dashboard", path: "/dashboard" },
            { label: "Community Forum", path: "/Community" },
            { label: "Contact Us", path: "/contact" },
            { label: "Code Analyzer", path: "/Codeanalyser" },
          ].map((btn, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate(btn.path)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-700 via-indigo-700 to-yellow-500 text-white rounded-lg shadow font-pressStart text-xs sm:text-sm"
            >
              {btn.label}
            </motion.button>
          ))}
        </div>
      </nav>

      {/* 🔹 Dashboard Body */}
      <div className="flex-1 flex flex-col px-2 sm:px-4 pb-4 overflow-hidden">
        {loading ? (
          <p className="text-purple-400 text-center text-lg animate-pulse">
            Loading dashboard...
          </p>
        ) : error ? (
          <div className="text-center">
            <p className="text-red-500 mb-4 font-semibold">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="flex flex-col h-full w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-purple-400">
                  Welcome, {data.username} 🎮
                </h1>
                <p className="text-gray-400 text-sm">Your Performance Dashboard</p>
              </div>
              <div className="text-lg sm:text-xl font-semibold">
                Total Score:{" "}
                <span className="text-purple-400">{data.totalScore}</span>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              {[
                { label: "Completed Levels", value: data.completedLevels },
                { label: "Accuracy", value: `${Number(data.accuracy).toFixed(1)}%` },
                { label: "Streak", value: `${data.streak} days` },
              ].map((card, i) => (
                <div
                  key={i}
                  className="bg-gray-900 p-2 rounded-md border-l-4 border-purple-500 shadow hover:shadow-purple-700/30 transition"
                >
                  <p className="text-gray-400 text-xs uppercase">{card.label}</p>
                  <p className="text-lg font-bold text-purple-400">{card.value}</p>
                </div>
              ))}
            </div>

            {/* Chart - Takes all remaining height */}
            <div className="bg-gray-900 rounded-lg p-4 flex-1 shadow-lg w-full">
  <h2 className="text-lg sm:text-xl font-semibold mb-2">
    Weekly Progress
  </h2>
  <div className="h-[200px] sm:h-[450px] w-full">
    <canvas ref={chartRef}></canvas>
  </div>
</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardUser;
