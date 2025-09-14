import { User } from "../models/user.model.js";

// ✅ Update Score
export const updateScore = async (req, res) => {
  const { level, score } = req.body;
  const userId = req.userId; // Get userId from verifyToken middleware

  if (!userId || !level || score == null) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Initialize gameScores if undefined
    if (!user.gameScores) {
      user.gameScores = new Map();
    }

    user.gameScores.set(level, score);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Score updated",
      scores: Object.fromEntries(user.gameScores),
    });
  } catch (err) {
    console.error("Error updating score:", err);
    res.status(500).json({ message: "Error updating score" });
  }
};

// ✅ Get Individual Score
export const getScore = async (req, res) => {
  try {
    const email = req.params.email?.trim().toLowerCase();
    const userId = req.params.userId;
    const query = email ? { email } : { _id: userId };

    const user = await User.findOne(query).select("gameScores");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const scoreObj = user.gameScores ? Object.fromEntries(user.gameScores) : {};
    res.status(200).json({ gameScores: scoreObj });
  } catch (err) {
    console.error("Error fetching scores:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Get Leaderboard (Fixed)
export const getLeaderboard = async (req, res) => {
  try {
    console.log("Starting leaderboard fetch at", new Date().toISOString());

    if (!User.db.readyState === 1) {
      throw new Error("MongoDB not connected");
    }

    const users = await User.find().select("name email gameScores").lean();
    console.log("Users fetched:", users.length);

    const leaderboard = users
      .map((user, index) => {
        try {
          if (!user || !user._id || !user.email) {
            console.warn(`Invalid user at index ${index}`);
            return null;
          }

          let totalScore = 0;

          // ✅ Convert gameScores object to Map if needed
          const scores = user.gameScores;

          if (scores && typeof scores === "object") {
            const entries = Object.entries(scores);
            for (const [level, score] of entries) {
              if (typeof score === "number" && !isNaN(score)) {
                totalScore += score;
              } else {
                console.warn(`Invalid score for ${user.email}: ${score}`);
              }
            }
          }

          return {
            id: user._id.toString(),
            name: user.name || user.email.split("@")[0],
            score: totalScore,
          };
        } catch (err) {
          console.error(`Error processing user ${user.email || user._id || index}:`, err.message);
          return null;
        }
      })
      .filter(user => user !== null && user.score > 0)
      .sort((a, b) => b.score - a.score);

    console.log("Leaderboard generated:", leaderboard);
    res.status(200).json({ leaderboard });
  } catch (err) {
    console.error("Error fetching leaderboard:", err.message);
    res.status(500).json({ message: `Internal server error: ${err.message}` });
  }
};

// ✅ Get User Dashboard (New)
export const getUserDashboard = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("name email gameScores");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const scores =
      user.gameScores instanceof Map
        ? Object.fromEntries(user.gameScores)
        : user.gameScores || {};

    const totalScore = Object.values(scores).reduce((sum, s) => sum + (parseInt(s) || 0), 0);
    const completedLevels = Object.keys(scores).length;

    // Generate dummy 7-day weekly scores from latest entries
    const weeklyScores = Array(7)
      .fill(0)
      .map((_, i) => {
        const keys = Object.keys(scores);
        return keys[i] ? scores[keys[i]] : 0;
      });

    const accuracy =
      completedLevels > 0
        ? Math.min(100, Math.floor((totalScore / (completedLevels * 100)) * 100))
        : 0;

    const streak = completedLevels; // Basic streak logic

    res.status(200).json({
      username: user.name || user.email,
      weeklyScores,
      totalScore,
      completedLevels,
      accuracy,
      streak,
    });
  } catch (err) {
    console.error("Dashboard fetch error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
