const express = require('express');
const router = express.Router();
const {
  crearTurno,
  listarTurnos,
  obtenerTurno,
  actualizarTurno,
  eliminarTurno,
  actualizarDiagnostico, // para editar solo diagnóstico
} = require('../controllers/turnoController');
const Turno = require('../models/turnoModel');

// Listar todos los turnos
router.get('/', listarTurnos);

// Crear nuevo turno
router.post('/', crearTurno);

// Obtener un turno por ID
router.get('/:id', obtenerTurno);

// Editar diagnóstico específico
router.put('/:id/diagnostico', actualizarDiagnostico);

// Actualizar turno completo
router.put('/:id', actualizarTurno);

// Eliminar turno
router.delete('/:id', eliminarTurno);

// Obtener historial de turnos por cliente
router.get('/historial/:clienteId', async (req, res) => {
  const { clienteId } = req.params;
  try {
    const turnos = await Turno.find({ cliente: clienteId }).sort({ fecha: -1 });
    res.json(turnos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener historial" });
  }
});

module.exports = router;


