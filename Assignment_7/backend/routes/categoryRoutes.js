const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { protect, admin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  const categories = await Category.find({});
  res.json(categories);
});

router.post('/', protect, admin, async (req, res) => {
  const { name, description, image } = req.body;

  const categoryExists = await Category.findOne({ name });
  if (categoryExists) {
    return res.status(400).json({ message: 'Category already exists' });
  }

  const category = new Category({ name, description, image });
  const createdCategory = await category.save();
  res.status(201).json(createdCategory);
});

module.exports = router;
