const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

function authRequired(req, res, next) {
  // Accept token from cookie or Authorization header
  const headerToken = req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null;
  const token = req.cookies.token || headerToken;

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, name }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }
}

module.exports = { authRequired, JWT_SECRET };
