import express from "express";
import {
  getScore,
  getLeaderboard,
  updateScore,
  getUserDashboard // ⬅️ New controller function
} from "../controllers/score.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

console.log("Score routes registered at", new Date().toISOString()); // Debug: Confirm routes load

// ✅ Update player's score
router.post("/", verifyToken, updateScore);

// ✅ Leaderboard route
router.get("/leaderboard", (req, res, next) => {
  console.log("Leaderboard route hit at", new Date().toISOString());
  getLeaderboard(req, res, next);
});

// ✅ Get current user's dashboard analytics
router.get("/user-dashboard", verifyToken, getUserDashboard);

// ✅ Get score by email
router.get(
  "/by-email/:email",
  (req, res, next) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.params.email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    next();
  },
  getScore
);

router.get(
  "/:userId",
  (req, res, next) => {
    const userIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!userIdRegex.test(req.params.userId)) {
      return res.status(400).json({ error: "Invalid userId format" });
    }
    next();
  },
  getScore
);
export default router;
