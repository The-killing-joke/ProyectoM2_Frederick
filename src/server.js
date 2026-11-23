const { loadEnvFile } = require('node:process');

// Cargo las variables del .env. En Railway este archivo no existe porque las
// variables se configuran en la plataforma, así que si no lo encuentra, sigo sin él.
try {
  loadEnvFile('.env');
} catch (error) {
  // ENOENT significa que el archivo no existe. Si el error es otro, lo dejo pasar
  // para no ocultar un problema real.
  if (error.code !== 'ENOENT') throw error;
  console.log('No se encontró .env, se usan las variables del entorno');
}

// Importo la app después de cargar las variables, porque la conexión a la base
// de datos las va a necesitar en el momento en que se importe.
const app = require('./app');
const pool = require('./db/pool');

const PORT = process.env.PORT || 3000;

// Antes de levantar el servidor, compruebo que la base de datos responde.
// Si falla, prefiero que la app se detenga con un mensaje claro y no que
// arranque y falle en cada petición.
async function start() {
  try {
    await pool.query('SELECT 1');
    console.log('Conectado a PostgreSQL');
  } catch (error) {
    console.error('No se pudo conectar a PostgreSQL:', error.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
  });
}

start();