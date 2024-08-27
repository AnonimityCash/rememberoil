// server/routes/vehicleRoutes.js
const express = require('express');
const router = express.Router();

module.exports = function(db) {
    router.post('/saveVehicle', (req, res) => {
        const { licensePlate, changeDate, kilometers, oilType, density, withFilter, interval, torque, brand, model, engine, password } = req.body;

        if (!licensePlate || !changeDate || !kilometers || !password) {
            return res.status(400).json({ message: 'Por favor, completa todos los campos requeridos' });
        }

        db.run(`INSERT INTO vehicles (licensePlate, changeDate, kilometers, oilType, density, withFilter, interval, torque, brand, model, engine, password) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [licensePlate, changeDate, kilometers, oilType, density, withFilter, interval, torque, brand, model, engine, password],
            function(err) {
                if (err) {
                    console.error('Error al guardar el vehículo:', err.message);
                    return res.status(500).json({ message: 'Error al guardar el vehículo' });
                }
                res.json({ message: 'Vehículo guardado con éxito' });
            });
    });

    router.post('/getVehicle/:licensePlate', (req, res) => {
        const licensePlate = req.params.licensePlate;
        const { password } = req.body;

        db.get(`SELECT * FROM vehicles WHERE licensePlate = ?`, [licensePlate], (err, row) => {
            if (err) {
                console.error('Error al obtener el vehículo:', err.message);
                return res.status(500).json({ message: 'Error al obtener el vehículo' });
            }
            if (!row) {
                return res.status(404).json({ message: 'Vehículo no encontrado' });
            }
            if (row.password !== password) {
                return res.status(403).json({ message: 'Contraseña incorrecta' });
            }
            res.json(row);
        });
    });

    router.post('/deleteVehicle/:licensePlate', (req, res) => {
        const licensePlate = req.params.licensePlate;
        const { password } = req.body;

        db.get(`SELECT * FROM vehicles WHERE licensePlate = ?`, [licensePlate], (err, row) => {
            if (err) {
                console.error('Error al buscar el vehículo:', err.message);
                return res.status(500).json({ message: 'Error al buscar el vehículo' });
            }
            if (!row) {
                return res.status(404).json({ message: 'Vehículo no encontrado' });
            }
            if (row.password !== password) {
                return res.status(403).json({ message: 'Contraseña incorrecta' });
            }

            db.run(`DELETE FROM vehicles WHERE licensePlate = ?`, [licensePlate], function(err) {
                if (err) {
                    console.error('Error al eliminar el vehículo:', err.message);
                    return res.status(500).json({ message: 'Error al eliminar el vehículo' });
                }
                if (this.changes === 0) {
                    return res.status(404).json({ message: 'Vehículo no encontrado' });
                }
                res.json({ message: 'Vehículo eliminado con éxito' });
            });
        });
    });

    return router;
};
