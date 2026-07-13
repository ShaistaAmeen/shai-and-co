const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const existing = db.get('users').find({ email: email.toLowerCase() }).value();
  if (existing) {
    return res.status(409).json({ error: 'An account with that email already exists.' });
  }

  const hashed = bcrypt.hashSync(password, 10);
  const user = {
    id: uuidv4(),
    name,
    email: email.toLowerCase(),
    password: hashed,
    createdAt: new Date().toISOString()
  };

  db.get('users').push(user).write();

  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, COOKIE_OPTIONS);
  res.status(201).json({
    message: 'Account created successfully.',
    user: { id: user.id, name: user.name, email: user.email },
    token
  });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.get('users').find({ email: email.toLowerCase() }).value();
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, COOKIE_OPTIONS);
  res.json({
    message: 'Logged in successfully.',
    user: { id: user.id, name: user.name, email: user.email },
    token
  });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out.' });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  const headerToken = req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null;
  const token = req.cookies.token || headerToken;
  if (!token) return res.status(200).json({ user: null });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ user: decoded });
  } catch {
    res.json({ user: null });
  }
});

module.exports = router;
