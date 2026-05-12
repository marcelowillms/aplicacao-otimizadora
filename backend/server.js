const express = require("express");
const cors = require("cors");

const loginRoutes = require("./routes/login");
const usuariosRoutes = require("./routes/usuarios");
const tarefasRoutes = require("./routes/tarefas");


const app = express();

app.use(cors());
app.use(express.json());


app.use("/login", loginRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/tarefas", tarefasRoutes);

app.listen(3000, () => {
    console.log("Servidor ok");
});