const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload"); 
const {
  crearTurno,
  listarTurnos,
  obtenerTurno,
  actualizarTurno,
  eliminarTurno,
  actualizarDiagnostico,
  historialPorClienteYProfesional,
  subirImagenTurno, 
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

// Subir imagen (multipart/form-data con campo "imagen")
router.post("/:id/imagen", upload.single("imagen"), subirImagenTurno);

//  imagen
router.delete("/:id/imagen", borrarImagenTurno);

module.exports = router;
