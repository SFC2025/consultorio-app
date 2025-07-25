const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  obraSocial: { type: String, required: true },
  numeroSesion: { type: Number, default: 0 },
});

module.exports = mongoose.model('Cliente', clienteSchema);
