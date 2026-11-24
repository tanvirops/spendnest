import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: { type: String, required: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    notes: { type: String, trim: true, default: '' },
    expenseDate: { type: Date, required: true, default: Date.now, index: true },
  },
  { timestamps: true },
);

expenseSchema.index({ userId: 1, expenseDate: -1 });

export default mongoose.model('Expense', expenseSchema);
