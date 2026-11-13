
const reservaService = require('../services/reserva.service');

const obtenerReservas = (req, res) => {
    const reservas = reservaService.obtenerTodas().filter(reserva =>
        req.usuario.rol === 'admin' || reserva.usuarioId === req.usuario.id
    );

    res.json(reservas);
};

const obtenerReservaPorId = (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            mensaje: 'ID no válido'
        });
    }

    const reserva = reservaService.obtenerPorId(id);

    if (!reserva) {
        return res.status(404).json({
            mensaje: 'Reserva no encontrada'
        });
    }

    if (req.usuario.rol !== 'admin' && reserva.usuarioId !== req.usuario.id) {
        return res.status(403).json({ mensaje: 'No tienes permiso para acceder a esta reserva' });
    }

    res.json(reserva);
};

const crearReserva = (req, res) => {
    try {
        const datos = { ...req.body };
        if (req.usuario.rol !== 'admin') datos.usuarioId = req.usuario.id;
        const nuevaReserva = reservaService.crear(datos);

        res.status(201).json(nuevaReserva);
    } catch (error) {
        res.status(400).json({
            mensaje: error.message
        });
    }
};

const actualizarReserva = (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ mensaje: 'ID no válido' });
    }

    try {
        const actual = reservaService.obtenerPorId(id);
        if (!actual) return res.status(404).json({ mensaje: 'Reserva no encontrada' });
        const datos = { ...req.body };
        if (req.usuario.rol !== 'admin') {
            if (actual.usuarioId !== req.usuario.id) {
                return res.status(403).json({ mensaje: 'No tienes permiso para modificar esta reserva' });
            }
            if (datos.estado === 'confirmada' && actual.estado !== 'confirmada') {
                return res.status(403).json({ mensaje: 'Solo un administrador puede confirmar una reserva' });
            }
            datos.usuarioId = req.usuario.id;
        }
        const reserva = reservaService.actualizar(id, datos);

        if (!reserva) {
            return res.status(404).json({
                mensaje: 'Reserva no encontrada'
            });
        }

        res.json(reserva);
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
};

const eliminarReserva = (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ mensaje: 'ID no válido' });
    }

    const actual = reservaService.obtenerPorId(id);
    if (actual && req.usuario.rol !== 'admin' && actual.usuarioId !== req.usuario.id) {
        return res.status(403).json({ mensaje: 'No tienes permiso para eliminar esta reserva' });
    }
    const eliminada = reservaService.eliminar(id);

    if (!eliminada) {
        return res.status(404).json({
            mensaje: 'Reserva no encontrada'
        });
    }

    res.json({ mensaje: 'Reserva eliminada correctamente' });
};



module.exports = { obtenerReservas, obtenerReservaPorId, crearReserva, actualizarReserva, eliminarReserva };
