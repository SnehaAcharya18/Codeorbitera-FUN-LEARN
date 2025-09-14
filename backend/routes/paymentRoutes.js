import express from "express";
import Payment from "../models/Payment.js";
import { User } from "../models/user.model.js";

const router = express.Router();

router.post("/save", async (req, res) => {
  try {
    const { userId, payment_id, score, amount, date } = req.body;

    // Validate input
    if (!userId || !payment_id || !score || isNaN(amount)) {
      console.error("Invalid input:", { userId, payment_id, score, amount });
      return res.status(400).json({
        message: "Invalid input: userId, payment_id, score, and amount are required",
        success: false,
      });
    }

    const user = await User.findById(userId);
    if (!user || !user.email) {
      console.error("User not found or missing email:", { userId, email: user?.email });
      return res.status(404).json({ message: "User not found or missing email", success: false });
    }

    // Convert amount from paise to rupees
    const amountInRupees = amount / 100;

    // 🔍 Check for existing payment by userId
    let payment = await Payment.findOne({ userId });

    if (payment) {
      // 🔄 Update existing payment
      payment.amount = (payment.amount || 0) + amountInRupees;
      payment.score = score;
      payment.payment_id = payment_id;
      payment.email = user.email;
      payment.date = date || Date.now();
      await payment.save();
      console.log("Updated payment:", payment);
    } else {
      // ✅ Create new payment
      payment = new Payment({
        userId,
        email: user.email,
        payment_id,
        score,
        amount: amountInRupees,
        date: date || Date.now(),
      });
      await payment.save();
      console.log("Created payment:", payment);
    }

    // 🧮 Get total amount paid so far by user (in rupees)
    const payments = await Payment.find({ email: user.email });
    const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // 📧 Send email receipt (amount in rupees)

    res.status(201).json({
      message: "Payment processed and email sent",
      success: true,
      totalPaid,
    });
  } catch (error) {
    console.error("❌ Payment Error:", error.message, error.stack);
    res.status(500).json({ error: error.message, success: false });
  }
});

export default router;