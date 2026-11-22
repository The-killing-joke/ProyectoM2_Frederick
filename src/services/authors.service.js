// Datos temporales en memoria, tomados del seed. Cuando conecte PostgreSQL,
// este archivo usará consultas SQL, pero las funciones mantendrán el mismo
// nombre y devolverán lo mismo, así las rutas no tendrán que cambiar.
let authors = [
  { id: 1, name: 'Ana García', email: 'ana@example.com', bio: 'Desarrolladora full-stack apasionada por Node.js' },
  { id: 2, name: 'Carlos Ruiz', email: 'carlos@example.com', bio: 'Escritor técnico especializado en bases de datos' },
  { id: 3, name: 'María López', email: 'maria@example.com', bio: 'Ingeniera de software con foco en APIs REST' },
];

// Simula el contador de ids que en la base de datos lleva IDENTITY.
let nextId = 4;

// Las funciones son async aunque ahora no esperan nada. Las consultas a la base
// sí serán asíncronas, y así las rutas ya están preparadas con await.
async function getAllAuthors() {
  return authors;
}

// Devuelve el author o null si no existe. La ruta decide si responde 404.
async function getAuthorById(id) {
  return authors.find((author) => author.id === id) ?? null;
}

async function createAuthor({ name, email, bio }) {
  const newAuthor = { id: nextId++, name, email, bio: bio ?? null };
  authors.push(newAuthor);
  return newAuthor;
}

// PUT reemplaza los datos del author. Devuelve null si el author no existe.
async function updateAuthor(id, { name, email, bio }) {
  const author = authors.find((a) => a.id === id);
  if (!author) return null;

  author.name = name;
  author.email = email;
  author.bio = bio ?? null;
  return author;
}

// Devuelve true si lo borró y false si no existía.
async function deleteAuthor(id) {
  const totalBefore = authors.length;
  authors = authors.filter((a) => a.id !== id);
  return authors.length < totalBefore;
}

module.exports = { getAllAuthors, getAuthorById, createAuthor, updateAuthor, deleteAuthor };