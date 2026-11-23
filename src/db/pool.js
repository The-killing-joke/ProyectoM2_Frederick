const { Pool } = require('pg');

// Un Pool mantiene varias conexiones abiertas y las reutiliza, en vez de abrir
// una conexión nueva en cada consulta. Los datos salen del .env (o de Railway).
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

module.exports = pool;