
const reservaService = require('../services/reserva.service');

const obtenerReservas = (req, res) => {
    const reservas = reservaService.obtenerTodas();

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

    res.json(reserva);
};

const crearReserva = (req, res) => {
    try {
        const nuevaReserva = reservaService.crear(req.body);

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
        const reserva = reservaService.actualizar(id, req.body);

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

    const eliminada = reservaService.eliminar(id);

    if (!eliminada) {
        return res.status(404).json({
            mensaje: 'Reserva no encontrada'
        });
    }

    res.json({ mensaje: 'Reserva eliminada correctamente' });
};



module.exports = { obtenerReservas, obtenerReservaPorId, crearReserva, actualizarReserva, eliminarReserva };
