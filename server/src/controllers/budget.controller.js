import Budget from '../models/Budget.js';

// Get all budgets for a user
export const getBudgets = async (req, res) => {
  try {
    const userId = req.user.id;
    const budgets = await Budget.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: budgets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get active budget
export const getActiveBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const budget = await Budget.findOne({
      userId,
      isActive: true,
      fromEffective: { $lte: now },
      toEffective: { $gte: now },
    });
    res.json({ success: true, data: budget });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get budget by ID
export const getBudgetById = async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, userId: req.user.id });
    if (!budget) return res.status(404).json({ success: false, message: 'Budget not found' });
    res.json({ success: true, data: budget });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create budget
export const createBudget = async (req, res) => {
  try {
    const { type, amount, fromEffective, toEffective, isActive } = req.body;

    if (!type || amount === undefined || !fromEffective || !toEffective) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const startDate = new Date(fromEffective);
    const endDate = new Date(toEffective);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid date format' });
    }

    if (startDate > endDate) {
      return res
        .status(400)
        .json({ success: false, message: 'fromEffective must be before toEffective' });
    }

    const active = isActive !== false;

    if (active) {
      await Budget.updateMany({ userId: req.user.id, type, isActive: true }, { isActive: false });
    }

    const budget = new Budget({
      userId: req.user.id,
      type,
      amount: Number(amount),
      fromEffective: startDate,
      toEffective: endDate,
      isActive: active,
    });

    await budget.save();
    res.status(201).json({ success: true, data: budget });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update budget
export const updateBudget = async (req, res) => {
  try {
    const { type, amount, fromEffective, toEffective, isActive } = req.body;
    const budget = await Budget.findOne({ _id: req.params.id, userId: req.user.id });

    if (!budget) return res.status(404).json({ success: false, message: 'Budget not found' });

    if (type !== undefined) budget.type = type;
    if (amount !== undefined) budget.amount = Number(amount);
    if (fromEffective !== undefined) budget.fromEffective = new Date(fromEffective);
    if (toEffective !== undefined) budget.toEffective = new Date(toEffective);

    if (fromEffective !== undefined || toEffective !== undefined) {
      const startDate =
        fromEffective !== undefined ? new Date(fromEffective) : budget.fromEffective;
      const endDate = toEffective !== undefined ? new Date(toEffective) : budget.toEffective;
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid date format' });
      }
      if (startDate > endDate) {
        return res
          .status(400)
          .json({ success: false, message: 'fromEffective must be before toEffective' });
      }
    }

    if (isActive !== undefined) {
      if (isActive && !budget.isActive) {
        await Budget.updateMany(
          { userId: req.user.id, type: budget.type, isActive: true, _id: { $ne: budget._id } },
          { isActive: false },
        );
      }
      budget.isActive = isActive;
    }

    await budget.save();
    res.json({ success: true, data: budget });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete budget
export const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, userId: req.user.id });
    if (!budget) return res.status(404).json({ success: false, message: 'Budget not found' });
    if (budget.isActive) {
      return res
        .status(400)
        .json({ success: false, message: 'Cannot delete an active budget. Deactivate it first.' });
    }
    await budget.deleteOne();
    res.json({ success: true, message: 'Budget deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
