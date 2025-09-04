const Cliente = require("../models/clienteModel");
const Turno = require("../models/turnoModel");

// Crear cliente (único por nombre y apellido)
const crearCliente = async (req, res) => {
  try {
    const { nombre, apellido, obraSocial, profesional, diagnostico } = req.body;

    if (!nombre || !apellido || !obraSocial || !profesional) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const yaExiste = await Cliente.findOne({
      nombre: nombre.toLowerCase(),
      apellido: apellido.toLowerCase(),
    });

    if (yaExiste) {
      return res.status(409).json({ error: "El paciente ya está registrado" });
    }

    const nuevo = await Cliente.create({
      nombre: nombre.toLowerCase(),
      apellido: apellido.toLowerCase(),
      obraSocial,
      diagnostico: diagnostico || "",
      numeroSesion: 0,
      profesional,
    });

    res.status(201).json(nuevo);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "El paciente ya está registrado" });
    }
    console.error("Error al crear cliente:", err);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// Listar clientes
const listarClientes = async (req, res) => {
  try {
    const { profesional } = req.query;
    const filter = profesional
      ? { profesional: { $regex: `^${profesional}$`, $options: "i" } }
      : {};
    const clientes = await Cliente.find(filter).sort({
      apellido: 1,
      nombre: 1,
    });
    res.json(clientes);
  } catch (err) {
    console.error("Error al listar clientes:", err);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// Obtener cliente por id
const obtenerCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente)
      return res.status(404).json({ error: "Cliente no encontrado" });
    res.json(cliente);
  } catch (err) {
    console.error("Error al obtener cliente:", err);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// Actualizar cliente
const actualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, obraSocial, diagnostico, profesional } = req.body;

    const actualizado = await Cliente.findByIdAndUpdate(
      id,
      {
        ...(nombre && { nombre: nombre.toLowerCase() }),
        ...(apellido && { apellido: apellido.toLowerCase() }),
        ...(obraSocial && { obraSocial }),
        ...(diagnostico && { diagnostico }),
        ...(profesional && { profesional }),
      },
      { new: true }
    );

    if (!actualizado) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json({ mensaje: "Cliente actualizado", cliente: actualizado });
  } catch (error) {
    console.error("Error al actualizar cliente", error);
    res.status(500).json({ error: "No se pudo actualizar el cliente" });
  }
};

// Eliminar cliente + TODOS sus turnos (cascada)
const eliminarCliente = async (req, res) => {
  try {
    const { id } = req.params;

    const cli = await Cliente.findById(id);
    if (!cli) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    // Eliminar cliente + TODOS sus turnos (con y sin clienteId)
    await Turno.deleteMany({
      $or: [
        { clienteId: id },
        {
          nombre: { $regex: `^${cli.nombre}$`, $options: "i" },
          apellido: { $regex: `^${cli.apellido}$`, $options: "i" },
          profesional: { $regex: `^${cli.profesional}$`, $options: "i" },
        },
      ],
    });

    await Cliente.deleteOne({ _id: id });

    return res.json({ ok: true, deletedClientId: id });
  } catch (err) {
    console.error("Error al eliminar cliente:", err);
    return res.status(500).json({ error: "Error del servidor" });
  }
};

const actualizarNumeroSesion = async (req, res) => {
  const { numeroSesion } = req.body;
  try {
    const cliente = await Cliente.findByIdAndUpdate(
      req.params.id,
      { numeroSesion },
      { new: true }
    );
    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    res.json(cliente);
  } catch (error) {
    console.error("Error al actualizar número de sesión:", error);
    res.status(500).json({ error: "Error al actualizar número de sesión" });
  }
};

module.exports = {
  crearCliente,
  listarClientes,
  obtenerCliente,
  actualizarCliente,
  eliminarCliente,
  actualizarNumeroSesion, // <-- AGREGUÉ ESTA FUNCIÓN
};
