const express = require('express');
const db = require('../config/db');

const router = express.Router();

// GET /api/products?category=&search=
router.get('/', (req, res) => {
  const { category, search, featured } = req.query;
  let products = db.get('products').value();

  if (category) {
    products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }
  if (featured === 'true') {
    products = products.filter(p => p.featured);
  }

  res.json({ products });
});

// GET /api/products/categories
router.get('/categories', (req, res) => {
  const products = db.get('products').value();
  const categories = [...new Set(products.map(p => p.category))];
  res.json({ categories });
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const product = db.get('products').find({ id: req.params.id }).value();
  if (!product) return res.status(404).json({ error: 'Product not found.' });
  res.json({ product });
});

module.exports = router;
