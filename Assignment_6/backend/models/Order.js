import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['requested', 'completed', 'cancelled'],
    default: 'requested'
  },
  // Payment details filled by buyer
  buyerName: { type: String, required: true },
  buyerPhone: { type: String, required: true },
  buyerAddress: { type: String, required: true },
  // Agreed price at time of purchase request
  agreedPrice: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
