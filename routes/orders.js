const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired);

// POST /api/orders  { shippingAddress }  -> checkout from current cart
router.post('/', (req, res) => {
  const { shippingAddress } = req.body;
  if (!shippingAddress || !shippingAddress.trim()) {
    return res.status(400).json({ error: 'Shipping address is required.' });
  }

  const cart = db.get('carts').find({ userId: req.user.id }).value();
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ error: 'Your cart is empty.' });
  }

  // Validate stock and build line items
  const lineItems = [];
  for (const item of cart.items) {
    const product = db.get('products').find({ id: item.productId }).value();
    if (!product) return res.status(404).json({ error: 'A product in your cart no longer exists.' });
    if (item.quantity > product.stock) {
      return res.status(400).json({ error: `Not enough stock for "${product.name}". Only ${product.stock} left.` });
    }
    lineItems.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      subtotal: +(product.price * item.quantity).toFixed(2)
    });
  }

  // Deduct stock
  lineItems.forEach(li => {
    const product = db.get('products').find({ id: li.productId });
    const current = product.value();
    product.assign({ stock: current.stock - li.quantity }).write();
  });

  const total = +lineItems.reduce((sum, li) => sum + li.subtotal, 0).toFixed(2);

  const order = {
    id: uuidv4(),
    userId: req.user.id,
    items: lineItems,
    total,
    shippingAddress: shippingAddress.trim(),
    status: 'processing',
    createdAt: new Date().toISOString()
  };

  db.get('orders').push(order).write();

  // Clear the cart
  db.get('carts').find({ userId: req.user.id }).assign({ items: [] }).write();

  res.status(201).json({ message: 'Order placed successfully.', order });
});

// GET /api/orders  -> current user's order history
router.get('/', (req, res) => {
  const orders = db.get('orders')
    .filter({ userId: req.user.id })
    .orderBy(['createdAt'], ['desc'])
    .value();
  res.json({ orders });
});

// GET /api/orders/:id
router.get('/:id', (req, res) => {
  const order = db.get('orders').find({ id: req.params.id, userId: req.user.id }).value();
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  res.json({ order });
});

module.exports = router;
