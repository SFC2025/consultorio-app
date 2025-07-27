const express = require('express');
const {
  crearCliente,
  listarClientes,
  obtenerCliente,
  actualizarCliente,
  eliminarCliente,
  normalizarClientes, // DEBE BORRARSE LUEGO
  actualizarNumeroSesion, // <-- IMPORTA ESTA FUNCIÓN
} = require('../controllers/clienteController');

const router = express.Router();

router.route('/')
  .get(listarClientes)
  .post(crearCliente);

router.route('/:id')
  .get(obtenerCliente)
  .put(actualizarCliente)
  .delete(eliminarCliente);

// NUEVA RUTA PARA EDITAR SESIONES
router.put('/:id/sesion', actualizarNumeroSesion);

// NO OLVIDARME DE BORRAR DESPUES!!!
router.get('/normalizar', normalizarClientes);

module.exports = router;