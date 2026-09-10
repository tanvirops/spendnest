import mongoose from 'mongoose';
import Saving from '../models/Saving.js';

// Get all savings for a user
export const getSavings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { year, month } = req.query;
    const filter = { userId };

    if (month) {
      filter.month = month; // Format: YYYY-MM
    } else if (year) {
      // Get all savings for a specific year
      filter.month = { $regex: `^${year}` };
    }

    const savings = await Saving.find(filter).sort({ month: -1 });
    res.json({ success: true, data: savings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get total savings
export const getTotalSavings = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await Saving.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const total = result[0]?.total || 0;
    res.json({ success: true, data: { total } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get saving by month
export const getSavingByMonth = async (req, res) => {
  try {
    const saving = await Saving.findOne({
      userId: req.user.id,
      month: req.params.month,
    });

    if (!saving)
      return res.status(404).json({ success: false, message: 'Saving record not found' });
    res.json({ success: true, data: saving });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create or update saving for a month
export const upsertSaving = async (req, res) => {
  try {
    const { month, amount, note } = req.body;

    if (!month || amount === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Validate month format (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ success: false, message: 'Month must be in YYYY-MM format' });
    }

    const saving = await Saving.findOneAndUpdate(
      { userId: req.user.id, month },
      {
        $set: {
          userId: req.user.id,
          month,
          amount: Number(amount),
          note: note || '',
        },
      },
      { upsert: true, new: true },
    );

    res.json({ success: true, data: saving });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete saving record
export const deleteSaving = async (req, res) => {
  try {
    const saving = await Saving.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!saving)
      return res.status(404).json({ success: false, message: 'Saving record not found' });
    res.json({ success: true, message: 'Saving record deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
