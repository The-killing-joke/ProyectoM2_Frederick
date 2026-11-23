const pool = require('../db/pool');

// Uso LEFT JOIN y no INNER JOIN porque author_id puede ser NULL (si se eliminó
// el author). Con INNER JOIN esos comentarios desaparecerían del resultado;
// con LEFT JOIN aparecen con author_name en null.
const COMMENT_SELECT = `
  SELECT c.id, c.content, c.post_id, c.author_id, c.created_at,
         a.name AS author_name
  FROM comments c
  LEFT JOIN authors a ON c.author_id = a.id`;

async function getAllComments() {
  const result = await pool.query(`${COMMENT_SELECT} ORDER BY c.id`);
  return result.rows;
}

async function getCommentsByPost(postId) {
  const result = await pool.query(`${COMMENT_SELECT} WHERE c.post_id = $1 ORDER BY c.id`, [postId]);
  return result.rows;
}

// Si post_id o author_id no existen, la base lanza el error 23503
// y el errorHandler responde 400.
async function createComment({ content, post_id, author_id }) {
  const result = await pool.query(
    `INSERT INTO comments (content, post_id, author_id)
     VALUES ($1, $2, $3)
     RETURNING id, content, post_id, author_id, created_at`,
    [content, post_id, author_id]
  );
  return result.rows[0];
}

module.exports = { getAllComments, getCommentsByPost, createComment };