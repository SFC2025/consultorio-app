// routes/verificarPin.js
const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
  const { pin } = req.body;
  const PIN_ESPERADO = process.env.PRO_PIN;

  if (pin === PIN_ESPERADO) {
    return res.json({ acceso: true });
  } else {
    return res.json({ acceso: false });
  }
});

module.exports = router;
