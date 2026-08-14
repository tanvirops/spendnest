import './env.js';
import express from 'express';
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

app.set('trust proxy', true); // Trust reverse proxy headers (e.g., X-Forwarded-For)

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/savings', savingRoutes);
app.use('/api/profile', profileRoutes);

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

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

export default app;
