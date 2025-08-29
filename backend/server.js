const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const reportRoutes = require("./routes/reportRoutes");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT;

// Conexão MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB conectado!"))
  .catch((err) => console.log(err));

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" })); // Para fotos
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use("/api/reports", reportRoutes);
// Teste de conexão
app.get("/", (req, res) => res.send("Servidor rodando"));

app.listen(PORT, () =>
  console.log(`Servidor rodando em http://localhost:${PORT}`)
);
