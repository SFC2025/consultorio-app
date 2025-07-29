module.exports = function validarApiKey(req, res, next) {
  const key = req.header('x-api-key');
  if (key !== process.env.API_KEY) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  next();
};
