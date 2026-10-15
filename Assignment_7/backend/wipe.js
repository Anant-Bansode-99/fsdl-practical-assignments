const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Review = require('./models/Review');

mongoose.connect('mongodb://127.0.0.1:27017/ecommerce_store')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});
    
    console.log('Data WIPED successfully.');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });
