const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  obraSocial: { type: String, required: true },
  numeroSesion: { type: Number, default: 0 },
  profesional: { type: String, required: true },  // Campo del profesional
  diagnostico: { type: String, default: "" }      // Campo opcional para diag inicial
});

// Índice único, case-insensitive para nombre + apellido
clienteSchema.index(
  { nombre: 1, apellido: 1 },
  { unique: true, collation: { locale: "es", strength: 2 } }
);

module.exports = mongoose.model('Cliente', clienteSchema);
