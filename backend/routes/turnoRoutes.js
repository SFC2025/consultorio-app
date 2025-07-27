const express = require('express');
const router = express.Router();
const {
  crearTurno,
  listarTurnos,
  obtenerTurno,
  actualizarTurno,
  eliminarTurno,
  actualizarDiagnostico,
  historialPorClienteYProfesional,
} = require('../controllers/turnoController');

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

// Historial por cliente con filtro por profesional
router.get('/historial/:clienteId', historialPorClienteYProfesional);

module.exports = router;
