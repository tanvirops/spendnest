import express from 'express';
import {
  getBudgets,
  getActiveBudget,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget
} from '../controllers/budget.controller.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

// All budget routes require authentication
router.use(authenticateJWT);

// Get all budgets
router.get('/', getBudgets);

// Get active budget
router.get('/active', getActiveBudget);

// Get single budget
router.get('/:id', getBudgetById);

// Create budget
router.post('/', createBudget);

// Update budget
router.put('/:id', updateBudget);

// Delete budget
router.delete('/:id', deleteBudget);

export default router;
