const jwt = require('jsonwebtoken');
const accessTokenSecret = process.env.JWT_SECRET || 'your_jwt_secret';

module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied.' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, accessTokenSecret);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid.' });
  }
};