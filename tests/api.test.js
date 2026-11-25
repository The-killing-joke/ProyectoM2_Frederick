import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { loadEnvFile } from 'node:process';

// Mi proyecto es CommonJS. Con createRequire cargo app y pool igual que los carga
// el servidor, así el test usa la misma conexión que la app y puedo cerrarla al final.
const require = createRequire(import.meta.url);

// Cargo el .env antes de importar el pool, porque el pool lee las variables al importarse.
try {
  loadEnvFile('.env');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

const app = require('../src/app');
const pool = require('../src/db/pool');

// Antes de los tests reinicio la base con los mismos scripts del proyecto,
// así siempre parto de los datos conocidos del seed.
beforeAll(async () => {
  await pool.query(readFileSync('sql/setup.sql', 'utf8'));
  await pool.query(readFileSync('sql/seed.sql', 'utf8'));
});

// Cierro la conexión al terminar para que Vitest no se quede esperando.
afterAll(async () => {
  await pool.end();
});

describe('GET /health', () => {
  test('responde 200 cuando la API está funcionando', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('GET / responde 200 con la información de la API', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('API MiniBlog');
  });
});

describe('Authors', () => {
  test('GET /authors devuelve los 3 authors del seed', async () => {
    const res = await request(app).get('/authors');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
  });

  test('GET /authors/1 devuelve el detalle de Ana García', async () => {
    const res = await request(app).get('/authors/1');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Ana García');
  });

  test('GET /authors/999 responde 404 si el author no existe', async () => {
    const res = await request(app).get('/authors/999');
    expect(res.status).toBe(404);
  });

  test('GET /authors/abc responde 400 si el id no es numérico', async () => {
    const res = await request(app).get('/authors/abc');
    expect(res.status).toBe(400);
  });

  test('POST /authors crea un author y responde 201', async () => {
    const res = await request(app)
      .post('/authors')
      .send({ name: 'Laura Méndez', email: 'laura@example.com', bio: 'Diseñadora UX' });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe('Laura Méndez');
  });

  test('POST /authors responde 400 si falta el name', async () => {
    const res = await request(app).post('/authors').send({ email: 'sinnombre@example.com' });
    expect(res.status).toBe(400);
    expect(res.body.details).toContain('name es obligatorio y no puede estar vacío');
  });

  test('POST /authors responde 400 si el email ya existe', async () => {
    const res = await request(app)
      .post('/authors')
      .send({ name: 'Ana Torres', email: 'ana@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Ya existe un author con ese email');
  });

  test('PUT /authors/2 actualiza el author y responde 200', async () => {
    const res = await request(app)
      .put('/authors/2')
      .send({ name: 'Carlos Ruiz Gómez', email: 'carlos@example.com', bio: 'Escritor técnico' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Carlos Ruiz Gómez');
  });

  test('DELETE /authors/999 responde 404 si el author no existe', async () => {
    const res = await request(app).delete('/authors/999');
    expect(res.status).toBe(404);
  });
});

describe('Posts', () => {
  test('GET /posts/author/1 devuelve los posts de Ana con sus datos', async () => {
    const res = await request(app).get('/posts/author/1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.body[0].author_name).toBe('Ana García');
  });

  test('GET /posts/author/999 responde 404 si el author no existe', async () => {
    const res = await request(app).get('/posts/author/999');
    expect(res.status).toBe(404);
  });

  test('POST /posts crea un post como borrador si no se envía published', async () => {
    const res = await request(app)
      .post('/posts')
      .send({ title: 'Índices en PostgreSQL', content: 'Un índice acelera las búsquedas...', author_id: 2 });

    expect(res.status).toBe(201);
    expect(res.body.published).toBe(false);
  });

  test('POST /posts responde 400 si el author_id no existe', async () => {
    const res = await request(app)
      .post('/posts')
      .send({ title: 'Post huérfano', content: 'No debería crearse', author_id: 999 });

    expect(res.status).toBe(400);
  });

  test('DELETE /posts/2 elimina el post: 204 y después 404', async () => {
    const deleteRes = await request(app).delete('/posts/2');
    expect(deleteRes.status).toBe(204);

    const getRes = await request(app).get('/posts/2');
    expect(getRes.status).toBe(404);
  });
});

describe('Comments', () => {
  test('GET /comments/post/1 devuelve los 2 comentarios del post', async () => {
    const res = await request(app).get('/comments/post/1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  test('POST /comments crea un comentario y responde 201', async () => {
    const res = await request(app)
      .post('/comments')
      .send({ content: 'Excelente explicación de REST', post_id: 3, author_id: 2 });

    expect(res.status).toBe(201);
    expect(res.body.post_id).toBe(3);
  });

  test('POST /comments responde 400 con los 3 errores si el body está vacío', async () => {
    const res = await request(app).post('/comments').send({});
    expect(res.status).toBe(400);
    expect(res.body.details).toHaveLength(3);
  });

  test('al eliminar un author, sus comentarios en posts ajenos quedan con author_id null', async () => {
    // María (author 3) comentó en el post 1, que es de Ana.
    const deleteRes = await request(app).delete('/authors/3');
    expect(deleteRes.status).toBe(204);

    const res = await request(app).get('/comments/post/1');
    const commentFromMaria = res.body.find((c) => c.content.startsWith('¿Podrías hacer'));
    expect(commentFromMaria.author_id).toBeNull();
  });

  test('al eliminar un post, se eliminan sus comentarios', async () => {
    const deleteRes = await request(app).delete('/posts/1');
    expect(deleteRes.status).toBe(204);

    const res = await request(app).get('/comments');
    const commentsOfPost1 = res.body.filter((c) => c.post_id === 1);
    expect(commentsOfPost1).toHaveLength(0);
  });
});