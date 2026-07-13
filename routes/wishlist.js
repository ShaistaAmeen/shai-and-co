const express = require('express');
const db = require('../config/db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired);

function getOrCreateWishlist(userId) {
  let wl = db.get('wishlists').find({ userId }).value();
  if (!wl) {
    wl = { userId, productIds: [] };
    db.get('wishlists').push(wl).write();
  }
  return wl;
}

// GET /api/wishlist
router.get('/', (req, res) => {
  const wl = getOrCreateWishlist(req.user.id);
  const products = db.get('products').filter(p => wl.productIds.includes(p.id)).value();
  res.json({ productIds: wl.productIds, products });
});

// POST /api/wishlist/:productId  -> toggle
router.post('/:productId', (req, res) => {
  const product = db.get('products').find({ id: req.params.productId }).value();
  if (!product) return res.status(404).json({ error: 'Product not found.' });

  const wl = getOrCreateWishlist(req.user.id);
  const idx = wl.productIds.indexOf(req.params.productId);
  let added;
  if (idx >= 0) {
    wl.productIds.splice(idx, 1);
    added = false;
  } else {
    wl.productIds.push(req.params.productId);
    added = true;
  }
  db.get('wishlists').find({ userId: req.user.id }).assign(wl).write();
  res.json({ added, productIds: wl.productIds });
});

module.exports = router;
