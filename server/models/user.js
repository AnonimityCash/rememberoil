// server/models/user.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ruta absoluta al archivo de la base de datos
const dbPath = path.resolve(__dirname, '../database/users.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al abrir la base de datos:', err.message);
    } else {
        console.log('Base de datos abierta con éxito.');
    }
});

// Crear tabla de usuarios y vehículos si no existen
db.serialize(() => {
    // Crear tabla de usuarios
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )`, (err) => {
        if (err) {
            console.error('Error al crear la tabla de usuarios:', err.message);
        } else {
            console.log('Tabla de usuarios creada o ya existe.');
        }
    });

    // Crear tabla de vehículos
    db.run(`CREATE TABLE IF NOT EXISTS vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        licensePlate TEXT UNIQUE,
        changeDate DATE,
        kilometers INTEGER,
        oilType TEXT,
        density TEXT,
        withFilter TEXT,
        interval INTEGER,
        torque INTEGER,
        brand TEXT,
        model TEXT,
        engine TEXT
    )`, (err) => {
        if (err) {
            console.error('Error al crear la tabla de vehículos:', err.message);
        } else {
            console.log('Tabla de vehículos creada o ya existe.');
        }
    });
});

module.exports = db;
