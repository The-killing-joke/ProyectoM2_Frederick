const express = require('express');

// Creo la aplicación de Express. Aquí solo la configuro, no la pongo a escuchar.
const app = express();

// Middleware para que la API pueda leer el JSON que llega en el body (POST y PUT).
// Sin esto, req.body llega como undefined.
app.use(express.json());

// Ruta de prueba para comprobar que la API está funcionando.
// También me sirve para verificar el deploy en Railway.
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API MiniBlog funcionando' });
});

// Exporto la app sin hacer listen, para que los tests con supertest puedan usarla
// sin levantar el servidor.
module.exports = app;