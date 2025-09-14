import express from "express";
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { User } from "../models/user.model.js";
import Payment from "../models/Payment.js";
import Certificate from "../models/Certificate.js";

const router = express.Router();

// Dashboard analytics
router.get('/dashboard', authMiddleware, adminOnly, async (req, res) => {
  try {
    // Total Users
    const totalUsers = await User.countDocuments();

    // Total Payments and Total Amount
    const payments = await Payment.find();
    const totalPayments = payments.length;
    const totalAmountPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Total Certificates
    const totalCertificates = await Certificate.countDocuments();

    // Most Popular Game (based on gameScores participation)
    const users = await User.find().select('gameScores');
    const gameScoresCount = {};
    users.forEach(u => {
      if (u.gameScores && u.gameScores.size > 0) {
        u.gameScores.forEach((score, game) => {
          gameScoresCount[game] = (gameScoresCount[game] || 0) + 1;
        });
      }
    });
    const mostPopularGame = Object.entries(gameScoresCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

    // Top Performers (based on highest gameScores value)
    const topPerformers = await User.aggregate([
      { $unwind: { path: '$gameScores', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: 1,
          email: 1,
          score: { $ifNull: ['$gameScores', {}] },
          maxScore: { $max: { $objectToArray: '$gameScores' } }
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          maxScore: { $ifNull: [{ $max: '$maxScore.v' }, 0] }
        }
      },
      { $sort: { maxScore: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalUsers,
      totalPayments,
      totalAmountPaid,
      totalCertificates,
      mostPopularGame,
      topPerformers
    });
  } catch (error) {
    console.error('Dashboard Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// --- User CRUD Operations ---
router.get('/users', authMiddleware, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/user/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { email, name, role } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { email, name, role },
      { new: true, runValidators: true }
    ).select('-password');
    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Invalid update data', error: error.message });
  }
});

router.delete('/user/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// --- Payment CRUD Operations ---
router.get('/payments', authMiddleware, adminOnly, async (req, res) => {
  try {
    const payments = await Payment.find().populate('userId', 'name email');
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/payment', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { userId, payment_id, score, amount, email, date } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const payment = new Payment({
      userId,
      email: email || user.email,
      payment_id,
      score,
      amount: amount / 100, // Convert paise to rupees
      date: date || Date.now()
    });
    await payment.save();
    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ message: 'Invalid payment data', error: error.message });
  }
});

router.put('/payment/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { userId, payment_id, score, amount, email, date } = req.body;
    const updated = await Payment.findByIdAndUpdate(
      req.params.id,
      { userId, payment_id, score, amount: amount / 100, email, date },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Invalid update data', error: error.message });
  }
});

router.delete('/payment/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json({ message: 'Payment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// --- Certificate CRUD Operations ---
router.get('/certificates', authMiddleware, adminOnly, async (req, res) => {
  try {
    const certificates = await Certificate.find();
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/certificate', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, email, score, paymentId, issuedAt } = req.body;
    const certificate = new Certificate({
      name,
      email,
      score,
      paymentId,
      issuedAt: issuedAt || Date.now()
    });
    await certificate.save();
    res.status(201).json({
      message: 'Certificate created',
      certificate,
      url: `/api/certificates/download/${certificate._id}`
    });
  } catch (error) {
    res.status(400).json({ message: 'Invalid certificate data', error: error.message });
  }
});

router.put('/certificate/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, email, score, paymentId, issuedAt } = req.body;
    const updated = await Certificate.findByIdAndUpdate(
      req.params.id,
      { name, email, score, paymentId, issuedAt },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Certificate not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Invalid update data', error: error.message });
  }
});

router.delete('/certificate/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const certificate = await Certificate.findByIdAndDelete(req.params.id);
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }
    res.json({ message: 'Certificate deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Leaderboard
router.get('/leaderboard', authMiddleware, adminOnly, async (req, res) => {
  try {
    const leaderboard = await User.aggregate([
      { $unwind: { path: '$gameScores', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: 1,
          email: 1,
          score: { $ifNull: ['$gameScores', {}] },
          maxScore: { $max: { $objectToArray: '$gameScores' } }
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          maxScore: { $ifNull: [{ $max: '$maxScore.v' }, 0] }
        }
      },
      { $sort: { maxScore: -1 } },
      { $limit: 10 }
    ]);
    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;