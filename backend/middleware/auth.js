// backend/middleware/auth.js
module.exports = function (req, res, next) {
  const key = req.header('x-api-key');
  if (!key || key !== process.env.API_KEY_SUPER) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  next();
};
