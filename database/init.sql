CREATE TABLE IF NOT EXISTS usuarios (

    id SERIAL PRIMARY KEY,

    nome VARCHAR(100) NOT NULL,

    email VARCHAR(150) UNIQUE NOT NULL,

    senha VARCHAR(255) NOT NULL,

    pontuacao INT DEFAULT 0,

    perfil VARCHAR(50) DEFAULT 'usuario',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP


);



CREATE TABLE IF NOT EXISTS tarefas (

    id SERIAL PRIMARY KEY,

    usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,

    titulo VARCHAR(255) NOT NULL,

    tempo_estimado INT,

    prioridade INT DEFAULT 1,

    categoria VARCHAR(100),

    status VARCHAR(50) DEFAULT 'pendente',

    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);



CREATE TABLE IF NOT EXISTS recompensas (

    id SERIAL PRIMARY KEY,

    usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,

    tipo VARCHAR(100),

    descricao TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);