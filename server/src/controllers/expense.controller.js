import mongoose from 'mongoose';
import Expense from '../models/Expense.js';
import Budget from '../models/Budget.js';

export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [totalAgg, monthAgg, todayAgg, countAgg, activeBudget, categoryAgg] = await Promise.all([
      Expense.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), expenseDate: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), expenseDate: { $gte: startOfToday } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.countDocuments({ userId }),
      Budget.findOne({ userId, isActive: true, fromEffective: { $lte: now }, toEffective: { $gte: now } }),
      Expense.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), expenseDate: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } }
      ])
    ]);

    const totalExpense = totalAgg[0]?.total || 0;
    const monthlyExpense = monthAgg[0]?.total || 0;
    const todayExpense = todayAgg[0]?.total || 0;
    const budgetAmount = activeBudget?.amount || 0;

    const remainingBudget = Math.max(0, budgetAmount - monthlyExpense);
    const budgetUsagePercent = budgetAmount > 0 ? ((monthlyExpense / budgetAmount) * 100).toFixed(1) : 0;

    let alertLevel = 'NORMAL';
    if (budgetAmount > 0) {
      if (monthlyExpense >= budgetAmount) alertLevel = 'EXCEEDED';
      else if (budgetUsagePercent >= 90) alertLevel = 'WARNING_90';
    }

    res.json({
      success: true,
      data: {
        totalExpense,
        monthlyExpense,
        todayExpense,
        totalExpensesCount: countAgg,
        budgetAmount,
        remainingBudget,
        budgetUsagePercent: Number(budgetUsagePercent),
        alertLevel,
        categoryBreakdown: categoryAgg
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all expenses with pagination and filtering
export const getExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, category, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    const filter = { userId };
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.expenseDate = {};
      if (startDate) filter.expenseDate.$gte = new Date(startDate);
      if (endDate) filter.expenseDate.$lte = new Date(endDate);
    }

    const [expenses, total] = await Promise.all([
      Expense.find(filter).sort({ expenseDate: -1 }).skip(skip).limit(Number(limit)),
      Expense.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: expenses,
      pagination: { page: Number(page), limit: Number(limit), total }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single expense
export const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user.id });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, data: expense });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create expense
export const createExpense = async (req, res) => {
  try {
    const { name, category, amount, notes, expenseDate } = req.body;

    if (!name || !category || amount === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const expense = new Expense({
      userId: req.user.id,
      name,
      category,
      amount: Number(amount),
      notes: notes || '',
      expenseDate: expenseDate ? new Date(expenseDate) : new Date()
    });

    await expense.save();
    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update expense
export const updateExpense = async (req, res) => {
  try {
    const { name, category, amount, notes, expenseDate } = req.body;
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });

    if (name !== undefined) expense.name = name;
    if (category !== undefined) expense.category = category;
    if (amount !== undefined) expense.amount = Number(amount);
    if (notes !== undefined) expense.notes = notes;
    if (expenseDate !== undefined) expense.expenseDate = new Date(expenseDate);

    await expense.save();
    res.json({ success: true, data: expense });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete expense
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};