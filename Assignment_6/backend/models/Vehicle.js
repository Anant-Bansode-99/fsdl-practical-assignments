import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  type: { type: String, enum: ['car', 'bike', 'other'], required: true },
  status: { type: String, enum: ['pending', 'approved', 'reserved', 'sold', 'rejected'], default: 'pending' },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  image: { type: String }, // URL or Base64
}, { timestamps: true });

export default mongoose.model('Vehicle', vehicleSchema);
