const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const verificarPinRouter = require("./routes/verificarPin"); // ✅ correcto
const auth = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5176",
      "https://consultorio-app-orcin.vercel.app",
      "https://kinesiaconsultorio.onrender.com",
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Permitir acceso
    } else {
      callback(new Error("No permitido por CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

mongoose.set("bufferCommands", false);

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  })

  .then(() => console.log("MongoDB conectado"))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

// ✅ Ruta pública (verificación de PIN)
app.use("/api/verificar-pin", verificarPinRouter);

// ✅ Rutas protegidas
app.use("/api/turnos", auth, require("./routes/turnoRoutes"));
app.use("/api/clientes", require("./routes/clienteRoutes"));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
