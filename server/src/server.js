// Ensure environment variables are loaded before any other module
import './env.js';

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import passport from 'passport';
import './config/passport.js';
import authRoutes from './routes/auth.js';
import expenseRoutes from './routes/expense.js';
import budgetRoutes from './routes/budget.js';
import savingRoutes from './routes/saving.js';
import profileRoutes from './routes/profile.js';
import { authenticateJWT, requireVerifiedEmail } from './middleware/auth.js';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  // credentials: true
}));
app.use(express.json());
app.use(passport.initialize());

// Diagnostic log: check passport strategies
try {
  const hasGoogle = !!(passport._strategy && passport._strategy('google'));
  console.log(`Passport google strategy present: ${hasGoogle}`);
} catch (e) {
  console.log('Passport strategy check failed', e.message);
}

// Authentication Routes
app.use('/api/auth', authRoutes);

// Protected Routes (require auth)
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/savings', savingRoutes);
app.use('/api/profile', profileRoutes);

// Protected & Verified Route Example
app.get('/api/protected', authenticateJWT, requireVerifiedEmail, (req, res) => {
  res.json({
    message: 'Access granted: Authenticated & Verified user',
    user: req.user,
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Database connection and server start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.error('Database connection error:', err));