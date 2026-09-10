import express from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  updateEmail,
} from '../controllers/profile.controller.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

// All profile routes require authentication
router.use(authenticateJWT);

// Get user profile
router.get('/', getProfile);

// Update profile (name, avatar)
router.put('/', updateProfile);

// Change password
router.post('/change-password', changePassword);

// Update email
router.put('/email', updateEmail);

// Delete account
router.delete('/', deleteAccount);

export default router;
