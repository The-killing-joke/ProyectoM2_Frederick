// Responde 404 cuando la URL no coincide con ninguna ruta de la API.
function notFound(req, res) {
  res.status(404).json({ error: `Ruta ${req.method} ${req.originalUrl} no encontrada` });
}

// Middleware global de errores. Express lo reconoce porque recibe 4 parámetros.
// En Express 5, si una ruta async lanza un error, llega aquí solo, sin try/catch.
function errorHandler(err, req, res, next) {
  // Códigos de error de PostgreSQL que probé en psql en el paso 5.

  // 23505: unique_violation, por ejemplo un email repetido.
  if (err.code === '23505') {
    const message = err.constraint === 'authors_email_key'
      ? 'Ya existe un author con ese email'
      : 'Ya existe un registro con ese valor';
    return res.status(400).json({ error: message });
  }

  // 23503: foreign_key_violation, por ejemplo un post con un author_id que no existe.
  // Respondo 400 y no 404 porque el dato incorrecto viene en el body,
  // no en la URL que pidió el cliente.
  if (err.code === '23503') {
    return res.status(400).json({ error: 'El registro relacionado no existe', detail: err.detail });
  }

  // 23514: check_violation. Las validaciones deberían atraparlo antes,
  // pero si algo se escapa, la base es la última defensa.
  if (err.code === '23514') {
    return res.status(400).json({ error: 'Los datos no cumplen las reglas de la base de datos' });
  }

  // JSON mal escrito en el body (lo detecta express.json()).
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El body no es un JSON válido' });
  }

  // Cualquier otro error es un fallo nuestro: lo registro en consola para
  // investigarlo, pero no le muestro los detalles internos al cliente.
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
}

module.exports = { notFound, errorHandler };