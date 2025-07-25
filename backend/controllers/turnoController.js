const Turno = require("../models/turnoModel");
const Cliente = require("../models/clienteModel");

const crearTurno = async (req, res) => {
  const { clienteId, diagnostico, profesional, fecha } = req.body;

  try {
    if (!clienteId || !diagnostico || !profesional) {
      return res.status(400).json({ error: "Faltan datos obligatorios." });
    }

    const cliente = await Cliente.findById(clienteId);
    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado." });
    }

    cliente.numeroSesion += 1;
    await cliente.save();

    const nuevoTurno = new Turno({
      clienteId,
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      diagnostico,
      profesional,
      fecha: fecha || new Date(),
    });

    await nuevoTurno.save();

    res.json({
      mensaje: "Turno creado",
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      obraSocial: cliente.obraSocial,
      numeroSesion: cliente.numeroSesion,
    });
  } catch (error) {
    console.error("❌ Error al crear turno:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

const obtenerTurnos = async (req, res) => {
  try {
    const turnos = await Turno.find().populate("clienteId").sort({ fecha: -1 });
    res.json(turnos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener turnos" });
  }
};

const actualizarDiagnostico = async (req, res) => {
  const { id } = req.params;
  const { diagnostico } = req.body;

  try {
    const actualizado = await Turno.findByIdAndUpdate(
      id,
      { diagnostico },
      { new: true }
    );

    res.json({ mensaje: "Diagnóstico actualizado", turno: actualizado });
  } catch (error) {
    console.error("Error al actualizar diagnóstico:", error);
    res.status(500).json({ error: "No se pudo actualizar el diagnóstico" });
  }
};

module.exports = {
  crearTurno,
  obtenerTurnos,
  actualizarDiagnostico, //  está bien acá
};


