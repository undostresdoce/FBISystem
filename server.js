const express = require("express");
const agentes = require("./data/agentes.js").results;
const jwt = require("jsonwebtoken");

const app = express();
const secretKey = "Shhhhh";

// Función para generar token
function generateToken(email) {
  return jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + 120,
      email,
    },
    secretKey
  );
}

// Ruta principal para servir el archivo HTML
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Ruta para autenticación
app.get("/SignIn", (req, res) => {
  let email = req.query.email;
  let pass = req.query.password;
  let agent = agentes.find((u) => u.email == email && u.password == pass);

  if (agent) {
    let token = generateToken(email);
    res.send(`
      <p> Agente autenticado, bienvenido <b>${email}</b></p>
      <p> Su token está en el sessionStorage</p>
      <a href="/Dashboard?token=${token}">Ir al Dashboard</a>
      <script>
        sessionStorage.setItem('token', JSON.stringify("${token}"));
      </script>
    `);
  } else {
    res.send("Usuario o contraseña incorrecta");
  }
});

// Ruta restringida
app.get("/Dashboard", (req, res) => {
  let token = req.query.token;
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      res
        .status(401)
        .send(
          `Usted no está autorizado para entrar al Dashboard, error => ${err.message}`
        );
    } else {
      res.send(`Bienvenido al Dashboard ${decoded.email}`);
    }
  });
});

// Iniciar el servidor
app.listen(3000, () => console.log("Server escuchando en el puerto 3000"));
