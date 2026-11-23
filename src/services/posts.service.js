const pool = require('../db/pool');

const POST_COLUMNS = 'id, title, content, author_id, published, created_at';

async function getAllPosts() {
  const result = await pool.query(`SELECT ${POST_COLUMNS} FROM posts ORDER BY id`);
  return result.rows;
}

async function getPostById(id) {
  const result = await pool.query(`SELECT ${POST_COLUMNS} FROM posts WHERE id = $1`, [id]);
  return result.rows[0] ?? null;
}

// Es el JOIN que probé en psql, con el authorId como parámetro.
// Uso alias para que el id y el created_at del post no se confundan con los del author.
async function getPostsByAuthor(authorId) {
  const result = await pool.query(
    `SELECT p.id, p.title, p.content, p.author_id, p.published, p.created_at,
            a.name AS author_name, a.email AS author_email
     FROM posts p
     INNER JOIN authors a ON p.author_id = a.id
     WHERE p.author_id = $1
     ORDER BY p.id`,
    [authorId]
  );
  return result.rows;
}

// Si no envían published, la base usa su DEFAULT FALSE. Por eso uso COALESCE:
// si el valor es null, toma el default de la columna.
async function createPost({ title, content, author_id, published }) {
  const result = await pool.query(
    `INSERT INTO posts (title, content, author_id, published)
     VALUES ($1, $2, $3, COALESCE($4, FALSE))
     RETURNING ${POST_COLUMNS}`,
    [title, content, author_id, published ?? null]
  );
  return result.rows[0];
}

async function updatePost(id, { title, content, author_id, published }) {
  const result = await pool.query(
    `UPDATE posts
     SET title = $1, content = $2, author_id = $3, published = COALESCE($4, FALSE)
     WHERE id = $5
     RETURNING ${POST_COLUMNS}`,
    [title, content, author_id, published ?? null, id]
  );
  return result.rows[0] ?? null;
}

async function deletePost(id) {
  const result = await pool.query('DELETE FROM posts WHERE id = $1', [id]);
  return result.rowCount > 0;
}

module.exports = { getAllPosts, getPostById, getPostsByAuthor, createPost, updatePost, deletePost };