const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.error(err));

app.use("/api/turnos", require("./routes/turnoRoutes"));
app.use("/api/clientes", require("./routes/clienteRoutes"));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
