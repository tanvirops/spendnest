import express from 'express';
import {
  getSavings,
  getTotalSavings,
  getSavingByMonth,
  upsertSaving,
  deleteSaving
} from '../controllers/saving.controller.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

// All saving routes require authentication
router.use(authenticateJWT);

// Get all savings (with optional year/month filter)
router.get('/', getSavings);

// Get total savings
router.get('/total', getTotalSavings);

// Get saving by month
router.get('/:month', getSavingByMonth);

// Create or update saving
router.post('/', upsertSaving);

// Delete saving
router.delete('/:id', deleteSaving);

export default router;
