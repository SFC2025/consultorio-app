import express from "express";
const router = express.Router();

router.post("/verificar-pin", (req, res) => {
  const { pin } = req.body;
  const PIN_SEGURO = process.env.PRO_PIN;

  if (pin === PIN_SEGURO) {
    res.json({ acceso: true });
  } else {
    res.status(401).json({ acceso: false, mensaje: "PIN incorrecto" });
  }
});

export default router;
