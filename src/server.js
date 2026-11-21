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

// Uso el puerto que me dé el entorno (Railway asigna el suyo) o el 3000 en local.
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});