const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect, admin } = require('../middleware/auth');

// POST: Place a new order (users only)
router.post('/', protect, async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  }

  // Block admin from placing orders
  if (req.user.role === 'admin') {
    return res.status(403).json({ message: 'Admins cannot place orders' });
  }

  const order = new Order({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    isPaid: true,
    paidAt: Date.now()
  });

  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
});

// GET: My orders (user)
router.get('/myorders', protect, async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// GET: All orders (admin only)
router.get('/all', protect, admin, async (req, res) => {
  const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
  res.json(orders);
});

// GET: Single order
router.get('/:id', protect, async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
});

// PUT: Admin confirms an order
router.put('/:id/confirm', protect, admin, async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    order.isConfirmed = true;
    order.confirmedAt = Date.now();
    const updated = await order.save();
    res.json(updated);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
});

// PUT: Admin marks as delivered
router.put('/:id/deliver', protect, admin, async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    const updated = await order.save();
    res.json(updated);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
});

module.exports = router;
