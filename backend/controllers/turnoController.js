const Turno = require("../models/turnoModel");
const Cliente = require("../models/clienteModel");

const crearTurno = async (req, res) => {
  const { clienteId, diagnostico, profesional, fechaHora } = req.body; // <-- fechaHora

  try {
    if (!clienteId || !profesional) {
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
      obraSocial: cliente.obraSocial,
      diagnostico: diagnostico || "",
      profesional,
      fechaHora: fechaHora || new Date(), // <-- usa fechaHora
      numeroSesion: cliente.numeroSesion,
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

// Listar todos los turnos
const listarTurnos = async (req, res) => {
  try {
    const turnos = await Turno.find().populate("clienteId").sort({ fecha: -1 });
    res.json(turnos);
  } catch (error) {
    console.error("Error al listar turnos:", error);
    res.status(500).json({ error: "Error al obtener turnos" });
  }
};

// Obtener un turno por ID
const obtenerTurno = async (req, res) => {
  try {
    const turno = await Turno.findById(req.params.id).populate("clienteId");
    if (!turno) return res.status(404).json({ error: "Turno no encontrado" });
    res.json(turno);
  } catch (error) {
    console.error("Error al obtener turno:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// Actualizar turno completo
const actualizarTurno = async (req, res) => {
  try {
    const { diagnostico, profesional, fecha } = req.body;
    const turnoActualizado = await Turno.findByIdAndUpdate(
      req.params.id,
      { diagnostico, profesional, fecha },
      { new: true }
    );
    if (!turnoActualizado)
      return res.status(404).json({ error: "Turno no encontrado" });

    res.json({ mensaje: "Turno actualizado", turno: turnoActualizado });
  } catch (error) {
    console.error("Error al actualizar turno:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// Eliminar turno y actualizar numeroSesion del cliente
const eliminarTurno = async (req, res) => {
  try {
    const { id } = req.params;

    // 1) Buscar y borrar el turno
    const turno = await Turno.findByIdAndDelete(id);
    if (!turno) {
      return res.status(404).json({ error: "Turno no encontrado" });
    }

    // 2) Decrementar numeroSesion del cliente
    const cliente = await Cliente.findById(turno.clienteId);
    if (cliente) {
      cliente.numeroSesion = Math.max(0, (cliente.numeroSesion || 0) - 1);
      await cliente.save();
    }

    return res.json({
      mensaje: "Diagnóstico eliminado correctamente",
      clienteActualizado: cliente, // <-- DEVUELVE el cliente con el nuevo numeroSesion
    });
  } catch (err) {
    console.error("Error al eliminar turno:", err);
    return res.status(500).json({ error: "Error del servidor" });
  }
};

// Nuevo endpoint
const historialPorClienteYProfesional = async (req, res) => {
  const { clienteId } = req.params;
  const { profesional } = req.query; // filtro por profesional

  try {
    const filter = { clienteId };
    if (profesional) filter.profesional = profesional;

    const historial = await Turno.find(filter).sort({ fechaHora: -1 });
    res.json(historial);
  } catch (error) {
    console.error("Error al cargar historial:", error);
    res.status(500).json({ error: "Error al obtener historial" });
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
  listarTurnos,
  obtenerTurno,
  actualizarTurno,
  eliminarTurno,
  actualizarDiagnostico,
  historialPorClienteYProfesional,
};
