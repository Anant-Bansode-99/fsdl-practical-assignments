const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect('mongodb://127.0.0.1:27017/ecommerce_store')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Check if admin exists
    const adminExists = await User.findOne({ email: 'admin@gmail.com' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      await User.create({
        name: 'Admin',
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Admin user created (admin@gmail.com / admin123)');
    } else {
      console.log('Admin user already exists');
    }
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });
