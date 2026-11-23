const express = require('express');
const postsRouter = require('./routes/posts.routes');
const authorsRouter = require('./routes/authors.routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const commentsRouter = require('./routes/comments.routes');

// Creo la aplicación de Express. Aquí solo la configuro, no la pongo a escuchar.
const app = express();

// Middleware para que la API pueda leer el JSON que llega en el body (POST y PUT).
// Sin esto, req.body llega como undefined.
app.use(express.json());

// Conecto el router de authors en la ruta base /authors. Todas las rutas que
// definí en authors.routes.js se van a anteponer con /authors.
app.use('/authors', authorsRouter); 

// Conecto el router de posts en la ruta base /posts. Todas las rutas que
// definí en posts.routes.js se van a anteponer con /posts.
app.use('/posts', postsRouter); 

 // Conecto el router de comments en la ruta base /comments. Todas las rutas que
// definí en comments.routes.js se van a anteponer con /comments.
app.use('/comments', commentsRouter);

// Si ninguna ruta respondió, es un 404,
// y si alguna lanzó un error, lo maneja errorHandler.
app.use(notFound);
app.use(errorHandler);


// Ruta de prueba para comprobar que la API está funcionando.
// También me sirve para verificar el deploy en Railway.
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API MiniBlog funcionando' });
});

// Exporto la app sin hacer listen, para que los tests con supertest puedan usarla
// sin levantar el servidor.
module.exports = app;