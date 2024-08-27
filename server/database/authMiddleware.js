const jwt = require('jsonwebtoken');
const secret = 'your_jwt_secret'; // Cambia esto por tu secreto real

// Middleware de autenticación
function authMiddleware(req, res, next) {
    // Obtener el token del encabezado de autorización
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    // Extraer el token del encabezado
    const token = authHeader.split(' ')[1]; // Asume que el formato es 'Bearer <token>'

    // Verificar el token
    jwt.verify(token, secret, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido' });
        }

        // Si el token es válido, añadir el usuario a la solicitud
        req.user = user;
        next();
    });
}

module.exports = authMiddleware;
