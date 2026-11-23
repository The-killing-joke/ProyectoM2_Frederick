const { Router } = require('express');
const postsService = require('../services/posts.service');
const authorsService = require('../services/authors.service');
const { validateIdParam, validatePost } = require('../middlewares/validators');

const router = Router();

// GET /posts - lista todos los posts
router.get('/', async (req, res) => {
  const posts = await postsService.getAllPosts();
  res.status(200).json(posts);
});

// GET /posts/author/:authorId - posts de un author con sus datos.
// La pongo antes de /:id porque es más específica. Así queda claro qué ruta
// atiende cada URL.
router.get('/author/:authorId', validateIdParam('authorId'), async (req, res) => {
  const authorId = Number(req.params.authorId);

  // Primero verifico que el author exista. Así distingo un author sin posts
  // (200 con lista vacía) de un author que no existe (404).
  const author = await authorsService.getAuthorById(authorId);
  if (!author) {
    return res.status(404).json({ error: 'Author no encontrado' });
  }

  const posts = await postsService.getPostsByAuthor(authorId);
  res.status(200).json(posts);
});

// GET /posts/:id - detalle de un post
router.get('/:id', validateIdParam('id'), async (req, res) => {
  const id = Number(req.params.id);
  const post = await postsService.getPostById(id);

  if (!post) {
    return res.status(404).json({ error: 'Post no encontrado' });
  }
  res.status(200).json(post);
});

// POST /posts - crea un post
router.post('/', validatePost, async (req, res) => {
  const newPost = await postsService.createPost(req.body);
  res.status(201).json(newPost);
});

// PUT /posts/:id - actualiza un post
router.put('/:id', validateIdParam('id'), validatePost, async (req, res) => {
  const id = Number(req.params.id);
  const updatedPost = await postsService.updatePost(id, req.body);

  if (!updatedPost) {
    return res.status(404).json({ error: 'Post no encontrado' });
  }
  res.status(200).json(updatedPost);
});

// DELETE /posts/:id - elimina un post
router.delete('/:id', validateIdParam('id'), async (req, res) => {
  const id = Number(req.params.id);
  const deleted = await postsService.deletePost(id);

  if (!deleted) {
    return res.status(404).json({ error: 'Post no encontrado' });
  }
  res.status(204).send();
});

module.exports = router;