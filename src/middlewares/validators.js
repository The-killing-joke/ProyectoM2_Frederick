// Funciones auxiliares para no repetir las mismas comprobaciones.

// Un texto válido debe ser string y tener algo más que espacios.
function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

// Mismo criterio que el CHECK email_format de setup.sql, para que la API
// responda 400 antes de que la base rechace el dato.
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

// Valida un parámetro numérico de la URL (:id, :authorId...). Recibe el nombre
// del parámetro y devuelve el middleware, así lo reutilizo en todas las rutas.
function validateIdParam(paramName) {
  return (req, res, next) => {
    const id = Number(req.params[paramName]);
    if (!isPositiveInteger(id)) {
      return res.status(400).json({ error: `${paramName} debe ser un número entero positivo` });
    }
    next();
  };
}

// Junto todos los errores en vez de responder con el primero, así quien usa
// la API ve de una vez todo lo que tiene que corregir.
function validateAuthor(req, res, next) {
  // En Express 5, si la petición no trae JSON, req.body es undefined.
  const { name, email, bio } = req.body ?? {};
  const details = [];

  if (!isNonEmptyString(name)) details.push('name es obligatorio y no puede estar vacío');
  if (!isNonEmptyString(email) || !EMAIL_REGEX.test(email)) {
    details.push('email es obligatorio y debe tener un formato válido');
  }
  // bio es opcional, pero si la envían tiene que ser texto.
  if (bio !== undefined && bio !== null && typeof bio !== 'string') details.push('bio debe ser texto');

  if (details.length > 0) {
    return res.status(400).json({ error: 'Datos inválidos', details });
  }
  next();
}

function validatePost(req, res, next) {
  const { title, content, author_id, published } = req.body ?? {};
  const details = [];

  if (!isNonEmptyString(title)) details.push('title es obligatorio y no puede estar vacío');
  if (!isNonEmptyString(content)) details.push('content es obligatorio y no puede estar vacío');
  if (!isPositiveInteger(author_id)) details.push('author_id es obligatorio y debe ser un número entero positivo');
  // published es opcional; si no llega, la base usa FALSE.
  if (published !== undefined && published !== null && typeof published !== 'boolean') {
    details.push('published debe ser true o false');
  }

  if (details.length > 0) {
    return res.status(400).json({ error: 'Datos inválidos', details });
  }
  next();
}

module.exports = { validateIdParam, validateAuthor, validatePost };