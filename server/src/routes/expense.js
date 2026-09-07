import express from 'express';
import {
  getDashboardSummary,
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseCategories
} from '../controllers/expense.controller.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

// All expense routes require authentication
router.use(authenticateJWT);

// Dashboard summary
router.get('/dashboard', getDashboardSummary);

// Get all expenses
router.get('/', getExpenses);
router.get('/categories', getExpenseCategories);

// Get single expense
router.get('/:id', getExpenseById);

// Create expense
router.post('/', createExpense);

// Update expense
router.put('/:id', updateExpense);

// Delete expense
router.delete('/:id', deleteExpense);

export default router;
