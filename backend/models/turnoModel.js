const mongoose = require("mongoose");

const turnoSchema = new mongoose.Schema({
  clienteId:   { type: mongoose.Schema.Types.ObjectId, ref: "Cliente", required: true },
  nombre:      { type: String, required: true },
  apellido:    { type: String, required: true },
  diagnostico: { type: String, default: "" },
  profesional: { type: String, required: true },
  obraSocial:  { type: String, required: true },
  numeroSesion:{ type: Number, default: 1 },
  fechaHora:   { type: Date, required: true },

  // 🔹 NUEVOS CAMPOS
  tratamiento:    { type: String, default: "" },
  imagenUrl:      { type: String, default: "" },   // URL pública para mostrar
  imagenPublicId: { type: String, default: "" },   // ID interno de Cloudinary (para borrar)
}, {
  timestamps: true
});

module.exports = mongoose.model("Turno", turnoSchema);
