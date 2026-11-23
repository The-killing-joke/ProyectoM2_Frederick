const { Router } = require('express');
const commentsService = require('../services/comments.service');
const postsService = require('../services/posts.service');
const { validateIdParam, validateComment } = require('../middlewares/validators');

const router = Router();

// GET /comments - lista todos los comentarios
router.get('/', async (req, res) => {
  const comments = await commentsService.getAllComments();
  res.status(200).json(comments);
});

// GET /comments/post/:postId - comentarios de un post.
// Mismo criterio que /posts/author/:authorId: si el post no existe respondo 404,
// y si existe pero no tiene comentarios, 200 con una lista vacía.
router.get('/post/:postId', validateIdParam('postId'), async (req, res) => {
  const postId = Number(req.params.postId);

  const post = await postsService.getPostById(postId);
  if (!post) {
    return res.status(404).json({ error: 'Post no encontrado' });
  }

  const comments = await commentsService.getCommentsByPost(postId);
  res.status(200).json(comments);
});

// POST /comments - crea un comentario
router.post('/', validateComment, async (req, res) => {
  const newComment = await commentsService.createComment(req.body);
  res.status(201).json(newComment);
});

module.exports = router;