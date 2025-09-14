import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import { connectDB } from "./db/connectDB.js";

import authRoutes from "./routes/auth.route.js";
import scoreRoutes from "./routes/score.route.js";
import adminRoutes from "./routes/admin.js";
import certificateRoutes from "./routes/cerificateRoutes.js"
import paymentRoutes from "./routes/paymentRoutes.js"
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// Apply CORS middleware first
app.use(cors({ origin: "http://localhost:5173", credentials: true, methods: ["GET", "POST", "OPTIONS"], allowedHeaders: ["Content-Type"] }));

app.use(express.json());
app.use(cookieParser());

// Mount routes after middleware
app.use("/api/admin", adminRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/score", scoreRoutes);
app.use("/api/payments", paymentRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));
  app.get(/^(?!\/api\/).*/, (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}
app.listen(PORT, () => {
  connectDB();
  console.log("Server is running on port: ", PORT);
});