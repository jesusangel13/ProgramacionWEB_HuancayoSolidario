-- ---------------------------
-- HUANCAYO SOLIDARIO DATABASE
-- ---------------------------

-- 1️⃣ Borrar base de datos antigua si existe
DROP DATABASE IF EXISTS huancayo_db;

-- 2️⃣ Crear nueva base de datos
CREATE DATABASE huancayo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 3️⃣ Seleccionar la base de datos
USE huancayo_db;

-- 4️⃣ Tabla de usuarios
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    role ENUM('volunteer','organization') DEFAULT 'volunteer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 5️⃣ Tabla de campañas
CREATE TABLE campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    location VARCHAR(150),
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    owner_id INT NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6️⃣ Tabla de actividades (agregada)
CREATE TABLE activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    activity VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 7️⃣ Insertar usuario de prueba (opcional)
INSERT INTO users (username, email, hashed_password, role)
VALUES ('admin', 'admin@huancayo.org', '123456', 'organization');

-- 8️⃣ Insertar campaña de prueba (opcional)
INSERT INTO campaigns (title, description, location, owner_id)
VALUES ('Campaña de prueba', 'Descripción de campaña de prueba', 'Huancayo', 1);

-- 9️⃣ Insertar actividad de prueba (opcional)
INSERT INTO activities (name, role, activity)
VALUES ('Juan Pérez', 'volunteer', 'Recolección de alimentos');
