const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const verificarPinRoutes = require("./routes/panel.routes");
const auth = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS restringido a frontend en producción + local dev
app.use(
  cors({
    origin: [
      "https://consultorio-app-orcin.vercel.app", // frontend producción
      "http://localhost:5173",                    // solo para desarrollo local
    ],
  })
);

app.use(express.json());

mongoose.set("bufferCommands", false);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

// ✅ Ruta pública (PIN)
app.use("/api", verificarPinRoutes);

// ✅ Rutas protegidas
app.use("/api/turnos", auth, require("./routes/turnoRoutes"));
app.use("/api/clientes", auth, require("./routes/clienteRoutes"));

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
