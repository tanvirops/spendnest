import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import passport from 'passport';
import User from '../models/User.js';
import { authenticateJWT } from '../middleware/auth.js';
import { getProfile, changePassword } from '../controllers/profile.controller.js';

const router = express.Router();

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, isVerified: user.isVerified },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Register Route
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'Email is already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomUUID();

    user = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationToken,
    });

    // Note: Send `verificationToken` via Nodemailer to user's email here
    res.status(201).json({
      message: 'Registration successful. Check your email for verification link.',
      verificationToken, 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Email Verification Endpoint
router.get('/verify-email/:token', async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) return res.status(400).json({ message: 'Invalid or expired verification token' });

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, isVerified: user.isVerified },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Initiate Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

// Google OAuth Callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/oauth/success?error=1` }),
  (req, res) => {
    try {
      console.log('Google callback - req.user:', req.user ? { id: req.user._id, email: req.user.email } : null);
      const token = generateToken(req.user);
      const masked = token ? `${token.slice(0, 8)}...` : 'no-token';
      console.log('Google callback - generated token:', masked);
      // Redirect to frontend with JWT in query params
      res.redirect(`${process.env.CLIENT_URL}/oauth/success?token=${token}`);
    } catch (err) {
      console.error('Google callback error:', err.message);
      res.redirect(`${process.env.CLIENT_URL}/oauth/success?error=1`);
    }
  }
);

// Profile endpoint aliases
router.get('/me', authenticateJWT, getProfile);
router.post('/change-password', authenticateJWT, changePassword);

export default router;