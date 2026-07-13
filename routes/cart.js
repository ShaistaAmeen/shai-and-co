const express = require('express');
const db = require('../config/db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired);

function getOrCreateCart(userId) {
  let cart = db.get('carts').find({ userId }).value();
  if (!cart) {
    cart = { userId, items: [] };
    db.get('carts').push(cart).write();
  }
  return cart;
}

function enrichCart(cart) {
  const products = db.get('products').value();
  const items = cart.items.map(item => {
    const product = products.find(p => p.id === item.productId);
    return {
      productId: item.productId,
      quantity: item.quantity,
      name: product ? product.name : 'Unknown product',
      price: product ? product.price : 0,
      image: product ? product.image : '',
      stock: product ? product.stock : 0,
      subtotal: product ? +(product.price * item.quantity).toFixed(2) : 0
    };
  });
  const total = +items.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2);
  return { items, total };
}

// GET /api/cart
router.get('/', (req, res) => {
  const cart = getOrCreateCart(req.user.id);
  res.json(enrichCart(cart));
});

// POST /api/cart  { productId, quantity }
router.post('/', (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = db.get('products').find({ id: productId }).value();
  if (!product) return res.status(404).json({ error: 'Product not found.' });
  if (quantity < 1) return res.status(400).json({ error: 'Quantity must be at least 1.' });
  if (quantity > product.stock) {
    return res.status(400).json({ error: `Only ${product.stock} units of "${product.name}" are in stock.` });
  }

  const cart = getOrCreateCart(req.user.id);
  const existingItem = cart.items.find(i => i.productId === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ productId, quantity });
  }

  db.get('carts').find({ userId: req.user.id }).assign(cart).write();
  res.json(enrichCart(cart));
});

// PUT /api/cart/:productId  { quantity }
router.put('/:productId', (req, res) => {
  const { quantity } = req.body;
  const product = db.get('products').find({ id: req.params.productId }).value();
  if (!product) return res.status(404).json({ error: 'Product not found.' });
  if (quantity < 1) return res.status(400).json({ error: 'Quantity must be at least 1.' });
  if (quantity > product.stock) {
    return res.status(400).json({ error: `Only ${product.stock} units of "${product.name}" are in stock.` });
  }

  const cart = getOrCreateCart(req.user.id);
  const item = cart.items.find(i => i.productId === req.params.productId);
  if (!item) return res.status(404).json({ error: 'Item not in cart.' });
  item.quantity = quantity;

  db.get('carts').find({ userId: req.user.id }).assign(cart).write();
  res.json(enrichCart(cart));
});

// DELETE /api/cart/:productId
router.delete('/:productId', (req, res) => {
  const cart = getOrCreateCart(req.user.id);
  cart.items = cart.items.filter(i => i.productId !== req.params.productId);
  db.get('carts').find({ userId: req.user.id }).assign(cart).write();
  res.json(enrichCart(cart));
});

// DELETE /api/cart  (clear)
router.delete('/', (req, res) => {
  const cart = getOrCreateCart(req.user.id);
  cart.items = [];
  db.get('carts').find({ userId: req.user.id }).assign(cart).write();
  res.json(enrichCart(cart));
});

module.exports = router;
