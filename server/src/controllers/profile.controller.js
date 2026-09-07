import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -verificationToken');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, avatar, currency } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (name !== undefined && String(name).trim()) {
      user.name = String(name).trim();
    }

    if (avatar !== undefined) {
      user.avatar = avatar || '';
    }

    if (currency !== undefined) {
      const normalizedCurrency = String(currency).toUpperCase();
      const allowedCurrencies = ['BDT', 'USD', 'EUR', 'GBP', 'INR'];

      if (!allowedCurrencies.includes(normalizedCurrency)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid currency selected',
        });
      }

      user.currency = normalizedCurrency;
    }

    await user.save();
    res.json({ success: true, data: user, message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Check if user has password (not OAuth-only account)
    if (!user.password) {
      return res.status(400).json({ success: false, message: 'Cannot change password for OAuth accounts' });
    }

    // Verify current password
    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete user account
export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required to delete account' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Verify password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ success: false, message: 'Password is incorrect' });
    }

    // Delete user and associated data
    await User.findByIdAndDelete(req.user.id);
    // Note: You may also want to delete associated expenses, budgets, and savings

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update email (with verification)
export const updateEmail = async (req, res) => {
  try {
    const { newEmail } = req.body;

    if (!newEmail) {
      return res.status(400).json({ success: false, message: 'New email is required' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: newEmail.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Reset verification status for new email
    user.email = newEmail.toLowerCase();
    user.isVerified = false;
    // In a real app, generate a verification token and send email

    await user.save();
    res.json({ success: true, data: user, message: 'Email updated. Please verify your new email.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
