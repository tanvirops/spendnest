import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['default', 'monthly'], default: 'monthly' },
  amount: { type: Number, required: true, min: 0 },
  fromEffective: { type: Date, required: true },
  toEffective: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Budget', budgetSchema);