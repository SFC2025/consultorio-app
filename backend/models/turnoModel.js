const mongoose = require("mongoose");

const turnoSchema = new mongoose.Schema({
  clienteId: { type: mongoose.Schema.Types.ObjectId, ref: "Cliente", required: true }, 
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  diagnostico: { type: String, default: "" },
  profesional: { type: String, required: true },
  obraSocial: { type: String, enum: ['Sancor', 'Jerárquicos'], default: null },
  numeroSesion: { type: Number, default: 1 },
  fechaHora: { type: Date, required: true },
}, {
  timestamps: true
});

module.exports = mongoose.model("Turno", turnoSchema);
