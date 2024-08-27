// server/server.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const vehicleRoutes = require('./routes/vehicleRoutes');
const auth = require('./models/auth');

const app = express();
const port = process.env.PORT || 3000; // Usar una variable de entorno para el puerto

// Configuración de la base de datos
const dbPath = path.join(__dirname, '../database/users.db');
if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    fs.closeSync(fs.openSync(dbPath, 'w'));
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al abrir la base de datos:', err.message);
    } else {
        console.log('Base de datos abierta con éxito.');
        db.run(`CREATE TABLE IF NOT EXISTS vehicles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            licensePlate TEXT NOT NULL,
            changeDate TEXT,
            kilometers INTEGER,
            oilType TEXT,
            density TEXT,
            withFilter TEXT,
            interval INTEGER,
            torque INTEGER,
            brand TEXT,
            model TEXT,
            engine TEXT,
            password TEXT
        )`, (err) => {
            if (err) {
                console.error('Error al crear la tabla vehicles:', err.message);
            } else {
                console.log('Tabla vehicles creada o ya existe.');
            }
        });
    }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public'), { extensions: ['html', 'htm'], charset: 'utf-8' }));

// Usa las rutas definidas en vehicleRoutes
app.use('/api/vehicles', vehicleRoutes(db));

// Rutas para registro y login
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    auth.registerUser(username, password, (err) => {
        if (err) return res.status(500).json({ message: 'Error al registrar el usuario' });
        res.json({ message: 'Usuario registrado con éxito' });
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    auth.authenticateUser(username, password, (err, token) => {
        if (err) return res.status(500).json({ message: 'Error al autenticar el usuario' });
        if (!token) return res.status(401).json({ message: 'Credenciales inválidas' });
        res.json({ token });
    });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Ocurrió un error en el servidor' });
});

const startMessage = `Servidor corriendo en http://localhost:${port} - ${new Date().toLocaleString()}`;
app.listen(port, () => {
    console.log(startMessage);
});
