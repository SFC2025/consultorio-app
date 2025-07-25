const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.error(err));

// Rutas
app.use("/api/turnos", require("./routes/turnos"));
app.use("/api/clientes", require("./routes/clientes"));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
