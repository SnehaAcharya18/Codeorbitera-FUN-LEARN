import express from "express";
import axios from "axios";
import bcryptjs from "bcryptjs";
import { User } from "../models/user.model.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
  logout,
  signup,
  verifyEmail,
  forgotPassword,
  resetPassword,
  checkAuth,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { updateScore, getScore } from "../controllers/score.controller.js";

const router = express.Router();
const CLIENT_ID = '94b224672f99d76571fdf88c66d3786f';
const CLIENT_SECRET = '5f2bbf4a460d8da927aed57c7b0643386fdb74fffe4117ce3e73dece72b1677b';

router.post("/score", verifyToken, updateScore);

router.post('/Codeanalyser', async (req, res) => {
  try {
    const { script, language, versionIndex, stdin } = req.body;
    const response = await axios.post('https://api.jdoodle.com/v1/execute', {
      script,
      language,
      versionIndex,
      stdin,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET
    });
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Execution failed' });
  }
});

router.get("/check-auth", verifyToken, checkAuth);

router.post('/getBotResponse', async (req, res) => {
  const userText = req.body.text;
  const API_KEY = process.env.GEMINI_API_KEY;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
  try {
    console.log("User asked:", userText);
    const response = await axios.post(endpoint, {
      contents: [{ parts: [{ text: userText }] }]
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log("Gemini response:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.message);
    res.status(500).send('Internal Server Error');
  }
});

router.post("/signup", signup);
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = generateTokenAndSetCookie(res, user._id, user.role);

    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token, // Include token in response
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("Error in login ", error);
    res.status(400).json({ success: false, message: error.message });
  }
});
router.post("/logout", logout);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;