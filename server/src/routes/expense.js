import express from 'express';
import {
  getDashboardSummary,
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense
} from '../controllers/expense.controller.js';
import { authenticateJWT, requireVerifiedEmail } from '../middleware/auth.js';

const router = express.Router();

// All expense routes require authentication and email verification
router.use(authenticateJWT, requireVerifiedEmail);

// Dashboard summary
router.get('/dashboard', getDashboardSummary);

// Get all expenses
router.get('/', getExpenses);

// Get single expense
router.get('/:id', getExpenseById);

// Create expense
router.post('/', createExpense);

// Update expense
router.put('/:id', updateExpense);

// Delete expense
router.delete('/:id', deleteExpense);

export default router;
