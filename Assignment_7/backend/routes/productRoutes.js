const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

router.get('/', async (req, res) => {
  const products = await Product.find({}).populate('category', 'name');
  res.json(products);
});

router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name');
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

router.post('/', protect, admin, upload.array('images', 5), async (req, res) => {
  const { name, description, price, category, stock } = req.body;
  const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

  const product = new Product({
    name,
    description,
    price,
    category,
    images,
    stock
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

module.exports = router;
