const express = require('express');
const {
  crearCliente,
  listarClientes,
  obtenerCliente,
  actualizarCliente,
  eliminarCliente
} = require('../controllers/clienteController');

const router = express.Router();

router.route('/')
  .get(listarClientes)
  .post(crearCliente);

router.route('/:id')
  .get(obtenerCliente)
  .put(actualizarCliente)
  .delete(eliminarCliente);

module.exports = router;
