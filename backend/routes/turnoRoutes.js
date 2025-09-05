const express = require("express");
const router = express.Router();

// ⬇️ Quitamos el middleware antiguo:
// const upload = require("../middleware/upload");

// ⬇️ Usamos Multer en memoria + Cloudinary directo
const multer = require("multer");
const uploadMem = multer({
  limits: { fileSize: 4 * 1024 * 1024 }, // 4 MB
  limits: { fileSize: 10 * 1024 * 1024 },
});
const cloudinary = require("../utils/cloudinary");
const Turno = require("../models/turnoModel");

const {
  crearTurno,
  listarTurnos,
  obtenerTurno,
  actualizarTurno,
  eliminarTurno,
  actualizarDiagnostico,
  historialPorClienteYProfesional,
  // subirImagenTurno,   // ⬅️ ya no usamos este para el POST
  borrarImagenTurno,
} = require("../controllers/turnoController");

// Listar todos los turnos
router.get("/", listarTurnos);

// Crear nuevo turno
router.post("/", crearTurno);

// Editar diagnóstico específico
router.put("/:id/diagnostico", actualizarDiagnostico);

// Actualizar turno completo
router.put("/:id", actualizarTurno);

// Eliminar turno
router.delete("/:id", eliminarTurno);

// Historial por cliente con filtro por profesional
router.get("/historial/:clienteId", historialPorClienteYProfesional);

// Obtener un turno por ID
router.get("/:id", obtenerTurno);

/**
 * Subir imagen (JPG/PNG) a Cloudinary desde buffer y guardar URL
 * POST /api/turnos/:id/imagen
 * FormData campo: "imagen"
 */
router.post("/:id/imagen", uploadMem.single("imagen"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Falta imagen" });
    if (!/^image\/(jpe?g|png)$/i.test(req.file.mimetype)) {
      return res.status(400).json({ error: "Formato no permitido (JPG/PNG)" });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "kinesia/turnos", resource_type: "image" },
        (err, r) => (err ? reject(err) : resolve(r))
      );
      stream.end(req.file.buffer);
    });

    const turno = await Turno.findByIdAndUpdate(
      req.params.id,
      { imagenUrl: result.secure_url },
      { new: true }
    );
    if (!turno) return res.status(404).json({ error: "Turno no encontrado" });

    return res.json({ ok: true, turno: { imagenUrl: turno.imagenUrl } });
  } catch (e) {
    console.error("Error al subir imagen:", e);
    return res.status(500).json({ error: "Error al subir imagen" });
  }
});

// Borrar imagen (puedes mantener tu controlador actual)
router.delete("/:id/imagen", borrarImagenTurno);

module.exports = router;
