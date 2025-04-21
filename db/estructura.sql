-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS app_peliculas_online;

-- Usar la base de datos
USE app_peliculas_online;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de películas
CREATE TABLE IF NOT EXISTS peliculas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    url_imagen VARCHAR(255) NOT NULL,
    precio DECIMAL(10, 2) DEFAULT 9.99,
    anio INT DEFAULT 2023,
    calificacion DECIMAL(3, 1) DEFAULT 8.5,
    duracion INT DEFAULT 120,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de compras (para futuras implementaciones)
CREATE TABLE IF NOT EXISTS compras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    pelicula_id INT NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    fecha_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (pelicula_id) REFERENCES peliculas(id) ON DELETE CASCADE
);

-- Tabla de categorías (para futuras implementaciones)
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

-- Tabla de relación películas-categorías (para futuras implementaciones)
CREATE TABLE IF NOT EXISTS peliculas_categorias (
    pelicula_id INT NOT NULL,
    categoria_id INT NOT NULL,
    PRIMARY KEY (pelicula_id, categoria_id),
    FOREIGN KEY (pelicula_id) REFERENCES peliculas(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
);

-- Insertar categorías de ejemplo
INSERT IGNORE INTO categorias (nombre) VALUES 
('Acción'), 
('Aventura'), 
('Comedia'), 
('Drama'), 
('Ciencia Ficción'), 
('Terror'), 
('Romance'), 
('Animación'), 
('Documental'), 
('Thriller');