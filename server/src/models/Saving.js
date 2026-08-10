import mongoose from 'mongoose';

const savingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  month: { type: String, required: true }, // Format: YYYY-MM
  amount: { type: Number, required: true, min: 0 },
  note: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Saving', savingSchema);