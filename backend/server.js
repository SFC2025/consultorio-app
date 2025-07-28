const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const auth = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// (opcional, pero recomendado)
mongoose.set('bufferCommands', false);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
})
  .then(() => console.log("MongoDB conectado"))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

// Rutas con auth
app.use("/api/turnos", auth, require("./routes/turnoRoutes"));
app.use("/api/clientes", auth, require("./routes/clienteRoutes"));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
