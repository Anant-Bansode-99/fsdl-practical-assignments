const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

router.post('/:productId', protect, async (req, res) => {
  const { rating, comment } = req.body;
  const productId = req.params.productId;

  // Ensure user has purchased the product
  const orders = await Order.find({ user: req.user._id });
  const hasPurchased = orders.some(order => 
    order.orderItems.some(item => item.product.toString() === productId)
  );

  if (!hasPurchased) {
    return res.status(400).json({ message: 'You must buy and receive this product to review it.' });
  }

  const alreadyReviewed = await Review.findOne({ user: req.user._id, product: productId });
  if (alreadyReviewed) {
    return res.status(400).json({ message: 'Product already reviewed' });
  }

  const review = new Review({
    name: req.user.name,
    rating: Number(rating),
    comment,
    user: req.user._id,
    product: productId
  });

  await review.save();

  // Update product average rating
  const reviews = await Review.find({ product: productId });
  const numReviews = reviews.length;
  const averageRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

  await Product.findByIdAndUpdate(productId, { numReviews, averageRating });

  res.status(201).json({ message: 'Review added' });
});

router.get('/:productId', async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId });
  res.json(reviews);
});

module.exports = router;
