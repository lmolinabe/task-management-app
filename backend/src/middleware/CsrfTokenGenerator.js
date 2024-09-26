const crypto = require('crypto');

module.exports = function(req, res, next) {
  if (!req.cookies['csrf-token']) {
    const token = crypto.randomBytes(24).toString('hex');
    res.cookie('csrf-token', token, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax'
    });
  }
  next();
}