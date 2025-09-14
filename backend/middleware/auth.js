import jwt from 'jsonwebtoken';
import { User } from "../models/user.model.js";


export const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    console.error('No token provided');
    return res.status(401).json({ message: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    req.user = await User.findById(decoded.userId).select("-password");
    if (!req.user) {
      console.error(`User not found: ${decoded.userId}`);
      return res.status(401).json({ message: "User not found" });
    }
    console.log('Authenticated user:', req.user);
    next();
  } catch (err) {
    console.error('JWT Verification Error:', err.message, err.stack);
    res.status(401).json({ message: "Invalid token", error: err.message });
  }
};

export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    console.error('Access denied:', req.user ? req.user.role : 'No user');
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

