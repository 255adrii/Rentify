const sesionService = require('../services/sesion.service');

const autenticar = (req, res, next) => {
    const coincidencia = /^Bearer ([a-f0-9]{64})$/i.exec(req.get('authorization') || '');
    const usuario = coincidencia && sesionService.obtenerUsuario(coincidencia[1]);
    if (!usuario) {
        return res.status(401).json({ mensaje: 'Sesión no válida o caducada. Inicia sesión de nuevo.' });
    }
    req.token = coincidencia[1];
    req.usuario = usuario;
    next();
};

const requiereAdmin = (req, res, next) => {
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({ mensaje: 'Esta operación requiere un administrador' });
    }
    next();
};

const validarId = (req, res, next, valor) => {
    if (!/^\d+$/.test(valor) || !Number.isSafeInteger(Number(valor)) || Number(valor) <= 0) {
        return res.status(400).json({ mensaje: 'ID no válido' });
    }
    next();
};

module.exports = { autenticar, requiereAdmin, validarId };
