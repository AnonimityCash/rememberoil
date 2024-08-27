// server/models/auth.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('./user'); // Ruta correcta para el módulo de la base de datos
require('dotenv').config(); // Para manejar variables de entorno

// Usar la clave secreta del entorno
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Usa una clave secreta fuerte en un archivo .env

// Función para registrar un nuevo usuario
function registerUser(username, password, callback) {
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return callback(err);
        db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function(err) {
            if (err) return callback(err);
            callback(null); // No devolver el ID de usuario es una opción válida
        });
    });
}

// Función para autenticar un usuario
function authenticateUser(username, password, callback) {
    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
        if (err) return callback(err);
        if (!user) return callback(null, false);
        
        bcrypt.compare(password, user.password, (err, result) => {
            if (err) return callback(err);
            if (result) {
                const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
                return callback(null, token);
            }
            callback(null, false);
        });
    });
}

// Función para verificar un token JWT
function verifyToken(token, callback) {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return callback(err);
        callback(null, decoded);
    });
}

// Exportar las funciones necesarias
module.exports = {
    registerUser,
    authenticateUser,
    verifyToken // Asegúrate de exportar esta función si la usas en otro lugar
};
