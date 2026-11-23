const authorsService = require('./authors.service');

// Datos temporales en memoria, iguales a los de seed.sql.
let posts = [
  { id: 1, title: 'Introducción a Node.js', content: 'Node.js es un runtime de JavaScript...', author_id: 1, published: true },
  { id: 2, title: 'PostgreSQL vs MySQL', content: 'Ambas bases de datos tienen ventajas...', author_id: 2, published: true },
  { id: 3, title: 'APIs RESTful', content: 'REST es un estilo arquitectónico...', author_id: 1, published: true },
  { id: 4, title: 'Manejo de errores en Express', content: 'El manejo apropiado de errores...', author_id: 3, published: false },
  { id: 5, title: 'Async/Await explicado', content: 'Las promesas simplifican el código asíncrono...', author_id: 1, published: false },
];

let nextId = 6;

async function getAllPosts() {
  return posts;
}

async function getPostById(id) {
  return posts.find((post) => post.id === id) ?? null;
}

// Devuelve los posts de un author con su nombre y email en cada post,
// igual que el resultado del JOIN que probé en SQL.
async function getPostsByAuthor(authorId) {
  const author = await authorsService.getAuthorById(authorId);
  if (!author) return [];

  return posts
    .filter((post) => post.author_id === authorId)
    .map((post) => ({ ...post, author_name: author.name, author_email: author.email }));
}

// Si no envían published, el post queda como borrador (igual que DEFAULT FALSE en la base).
async function createPost({ title, content, author_id, published }) {
  const newPost = { id: nextId++, title, content, author_id, published: published ?? false };
  posts.push(newPost);
  return newPost;
}

async function updatePost(id, { title, content, author_id, published }) {
  const post = posts.find((p) => p.id === id);
  if (!post) return null;

  post.title = title;
  post.content = content;
  post.author_id = author_id;
  post.published = published ?? false;
  return post;
}

async function deletePost(id) {
  const totalBefore = posts.length;
  posts = posts.filter((p) => p.id !== id);
  return posts.length < totalBefore;
}

module.exports = { getAllPosts, getPostById, getPostsByAuthor, createPost, updatePost, deletePost };