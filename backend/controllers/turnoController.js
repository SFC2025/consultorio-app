const Turno = require("../models/turnoModel");
const Cliente = require("../models/clienteModel");
const cloudinary = require("../utils/cloudinary");

// Subir imagen a Cloudinary y guardar URL en el turno
const subirImagenTurno = async (req, res) => {
  try {
    const { id } = req.params;

    // Validaciones básicas

    if (!req.file) {
      return res.status(400).json({ error: "No se recibió archivo de imagen" });
    }

    // Subir a Cloudinary desde buffer

    const resultado = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "kinesia/turnos",

          resource_type: "image",

          // transformations opcionales: width, height, crop, quality, etc
        },

        (error, result) => {
          if (error) return reject(error);

          resolve(result);
        }
      );

      stream.end(req.file.buffer);
    });

    // Guardar URL y public_id en el turno

    const actualizado = await Turno.findByIdAndUpdate(
      id,
      { imagenUrl: resultado.secure_url, imagenPublicId: resultado.public_id },
      { new: true }
    );
    if (!actualizado) {
      return res.status(404).json({ error: "Turno no encontrado" });
    }
    res.json({
      mensaje: "Imagen subida correctamente",
      turno: actualizado,
    });
  } catch (error) {
    console.error("Error al subir imagen:", error);
    res.status(500).json({ error: "No se pudo subir la imagen" });
  }
};
// Borrar imagen asociada al turno (en Cloudinary y en Mongo)
const borrarImagenTurno = async (req, res) => {
  try {
    const { id } = req.params;

    const turno = await Turno.findById(id);
    if (!turno) return res.status(404).json({ error: "Turno no encontrado" });

    // Si hay imagen previa, eliminar de Cloudinary
    if (turno.imagenPublicId) {
      await cloudinary.uploader.destroy(turno.imagenPublicId);
    }

    turno.imagenUrl = "";
    turno.imagenPublicId = "";
    await turno.save();

    res.json({ mensaje: "Imagen eliminada correctamente", turno });
  } catch (error) {
    console.error("Error al borrar imagen:", error);
    res.status(500).json({ error: "No se pudo borrar la imagen" });
  }
};

const crearTurno = async (req, res) => {
  const { clienteId, diagnostico, profesional, fechaHora, tratamiento } =
    req.body; // <-- fechaHora

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
      tratamiento: tratamiento || "", // agregado
      // imagenUrl/imagenPublicId se setean cuando subís la imagen por el endpoint específico
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
// GET /api/turnos?profesional=...&dia=YYYY-MM-DD
const listarTurnos = async (req, res) => {
  try {
    const { profesional, dia } = req.query;

    const q = {};
    if (profesional) {
      q.profesional = { $regex: `^${profesional}$`, $options: "i" };
    }

    if (dia) {
      const [y, m, d] = dia.split("-").map(Number);
      const start = new Date(y, m - 1, d, 0, 0, 0, 0); // local 00:00
      const end = new Date(y, m - 1, d, 23, 59, 59, 999); // local 23:59
      q.fechaHora = { $gte: start, $lte: end };
    }

    const turnos = await Turno.find(q)
      .sort({ fechaHora: -1, createdAt: -1 })
      .lean();
    res.json(turnos);
  } catch (err) {
    console.error("Error listarTurnos:", err);
    res.status(500).json({ error: "Error al listar turnos" });
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
    const allowed = [
      "diagnostico",
      "profesional",
      "fechaHora",
      "tratamiento",
      "obraSocial",
      "numeroSesion",
      "nombre",
      "apellido",
    ];

    const data = {};
    for (const k of allowed) if (k in req.body) data[k] = req.body[k];

    const turnoActualizado = await Turno.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true, runValidators: true }
    );

    if (!turnoActualizado) {
      return res.status(404).json({ error: "Turno no encontrado" });
    }

    res.json({ mensaje: "Turno actualizado", turno: turnoActualizado });
  } catch (e) {
    console.error("Error al actualizar turno:", e);
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

    const historial = await Turno.find(filter)
      .sort({ fechaHora: -1 })
      .select(
        "nombre apellido obraSocial diagnostico profesional numeroSesion fechaHora"
      );

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
  subirImagenTurno, // nuevo
  borrarImagenTurno, // opcional
};
