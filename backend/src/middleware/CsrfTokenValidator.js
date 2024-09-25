module.exports = function (req, res, next) {
  const tokenFromClient = req.body._csrf || req.headers['x-csrf-token'];
  const tokenFromCookie = req.cookies['csrf-token'];

  if (!tokenFromClient || tokenFromClient !== tokenFromCookie) {
    return res.status(403).send('Invalid CSRF token');
  }
  next();
}