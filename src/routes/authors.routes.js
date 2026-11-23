const { Router } = require('express');
const authorsService = require('../services/authors.service');
const { validateIdParam, validateAuthor } = require('../middlewares/validators');

// Router solo para /authors. En app.js lo conecto con esa ruta base,
// por eso aquí las rutas empiezan en '/'.
const router = Router();

// GET /authors - lista todos los authors
router.get('/', async (req, res) => {
  const authors = await authorsService.getAllAuthors();
  res.status(200).json(authors);
});

// GET /authors/:id - detalle de un author
router.get('/:id', validateIdParam('id'), async (req, res) => {
  // Los parámetros de la URL siempre llegan como texto, por eso paso el id a número.
  const id = Number(req.params.id);
  const author = await authorsService.getAuthorById(id);

  if (!author) {
    return res.status(404).json({ error: 'Author no encontrado' });
  }
  res.status(200).json(author);
});

// POST /authors - crea un author. Respondo 201 porque se creó un recurso nuevo.
router.post('/', validateAuthor, async (req, res) => {
  const newAuthor = await authorsService.createAuthor(req.body);
  res.status(201).json(newAuthor);
});

// PUT /authors/:id - actualiza un author
router.put('/:id', validateIdParam('id'), validateAuthor, async (req, res) => {
  const id = Number(req.params.id);
  const updatedAuthor = await authorsService.updateAuthor(id, req.body);

  if (!updatedAuthor) {
    return res.status(404).json({ error: 'Author no encontrado' });
  }
  res.status(200).json(updatedAuthor);
});

// DELETE /authors/:id - elimina un author. Respondo 204 porque no hay nada
// que devolver en el body.
router.delete('/:id', validateIdParam('id'), async (req, res) => {
  const id = Number(req.params.id);
  const deleted = await authorsService.deleteAuthor(id);

  if (!deleted) {
    return res.status(404).json({ error: 'Author no encontrado' });
  }
  res.status(204).send();
});

module.exports = router;