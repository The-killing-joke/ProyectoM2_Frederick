DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS authors;

CREATE TABLE authors (
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT name_not_empty CHECK (LENGTH(TRIM(name)) >= 1) 
);

CREATE TABLE posts (
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    author_id INT NOT NULL,
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT title_not_empty CHECK (LENGTH(TRIM(title)) >= 1),
    CONSTRAINT content_not_empty CHECK (LENGTH(TRIM(content)) >= 1),
    FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE
);

CREATE INDEX idx_posts_author_id ON posts(author_id);

CREATE TABLE comments (
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    content TEXT NOT NULL,
    post_id INT NOT NULL,
    -- Sin NOT NULL: si se elimina el author, el comentario se conserva con author_id en NULL.
    author_id INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT comment_content_not_empty CHECK (LENGTH(TRIM(content)) >= 1),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE SET NULL
);

-- Índices para listar los comentarios de un post y para que el SET NULL
-- encuentre rápido los comentarios de un author.
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
