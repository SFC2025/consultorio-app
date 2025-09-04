const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const verificarPinRouter = require("./routes/verificarPin");
const auth = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 5000;

const allowed = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5176",
  /^https:\/\/consultorio-app-.*\.vercel\.app$/, // previews
  "https://consultorio-app-orcin.vercel.app", // producción
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // Postman/mobile
      const ok = allowed.some((rule) =>
        rule instanceof RegExp ? rule.test(origin) : rule === origin
      );
      cb(ok ? null : new Error("CORS blocked: " + origin), ok);
    },
    credentials: true,
  })
);

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

/* ✅ Ruta pública de prueba */
app.get("/api/ping", (_req, res) => res.send("pong"));

/* ✅ Ruta pública (verificación de PIN) */
app.use("/api/verificar-pin", verificarPinRouter);

/* ✅ Rutas protegidas */
app.use("/api/turnos", auth, require("./routes/turnoRoutes"));
app.use("/api/clientes", require("./routes/clienteRoutes"));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
