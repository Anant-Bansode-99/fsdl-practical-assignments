import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Serve static files from 'uploads' directory
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);

// Default route
app.get('/', (req, res) => res.send('Used Vehicle E-commerce API'));

const PORT = process.env.PORT || 5000;

import User from './models/User.js';
import bcrypt from 'bcryptjs';

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@gmail.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await User.create({
        name: 'Super Admin',
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Admin account seeded: admin@gmail.com');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
};

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/used-vehicles')
  .then(() => {
    console.log('Connected to MongoDB');
    seedAdmin();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('Error connecting to MongoDB:', err));
