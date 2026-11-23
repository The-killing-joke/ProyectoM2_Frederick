const pool = require('../db/pool');

// Columnas que devuelvo siempre, para no repetirlas en cada consulta.
const AUTHOR_COLUMNS = 'id, name, email, bio, created_at';

async function getAllAuthors() {
  const result = await pool.query(`SELECT ${AUTHOR_COLUMNS} FROM authors ORDER BY id`);
  return result.rows;
}

// Uso $1 en vez de meter el id directamente en el texto de la consulta.
// pg envía el valor por separado y así se evita la inyección SQL.
async function getAuthorById(id) {
  const result = await pool.query(`SELECT ${AUTHOR_COLUMNS} FROM authors WHERE id = $1`, [id]);
  return result.rows[0] ?? null;
}

// RETURNING devuelve la fila recién creada, con el id y el created_at
// que generó la base.
async function createAuthor({ name, email, bio }) {
  const result = await pool.query(
    `INSERT INTO authors (name, email, bio) VALUES ($1, $2, $3) RETURNING ${AUTHOR_COLUMNS}`,
    [name, email, bio ?? null]
  );
  return result.rows[0];
}

// Si el id no existe, el UPDATE no afecta ninguna fila y rows queda vacío,
// por eso devuelvo null para que la ruta responda 404.
async function updateAuthor(id, { name, email, bio }) {
  const result = await pool.query(
    `UPDATE authors SET name = $1, email = $2, bio = $3 WHERE id = $4 RETURNING ${AUTHOR_COLUMNS}`,
    [name, email, bio ?? null, id]
  );
  return result.rows[0] ?? null;
}

// rowCount dice cuántas filas borró. Si es 0, el author no existía.
// Sus posts se borran solos por el ON DELETE CASCADE.
async function deleteAuthor(id) {
  const result = await pool.query('DELETE FROM authors WHERE id = $1', [id]);
  return result.rowCount > 0;
}

module.exports = { getAllAuthors, getAuthorById, createAuthor, updateAuthor, deleteAuthor };