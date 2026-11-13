
const reservaRepository = require('../repositories/reserva.repository');

const obtenerTodas = () => {
    return reservaRepository.obtenerTodas();
};

const obtenerPorId = (id) => {
    return reservaRepository.obtenerPorId(id);
};

const viviendaRepository = require('../repositories/vivienda.repository');

const crear = (datosReserva) => {
    const {
        viviendaId,
        usuarioId,
        fechaInicio,
        fechaFin
    } = datosReserva;

    if (
        !Number.isInteger(viviendaId) ||
        !Number.isInteger(usuarioId) ||
        viviendaId <= 0 ||
        usuarioId <= 0
    ) {
        throw new Error('Los identificadores no son válidos');
    }

    if (!viviendaRepository.obtenerPorId(viviendaId)) {
        throw new Error('La vivienda no existe');
    }

    const formatoFecha = /^\d{4}-\d{2}-\d{2}$/;

    if (
        typeof fechaInicio !== 'string' ||
        typeof fechaFin !== 'string' ||
        !formatoFecha.test(fechaInicio) ||
        !formatoFecha.test(fechaFin) ||
        !Number.isFinite(Date.parse(fechaInicio)) ||
        !Number.isFinite(Date.parse(fechaFin)) ||
        fechaInicio >= fechaFin
    ) {
        throw new Error('Las fechas no son válidas');
    }

    return reservaRepository.crear({
        viviendaId,
        usuarioId,
        fechaInicio,
        fechaFin,
        estado: 'pendiente'
    });
};

const actualizar = (id, datosReserva) => {
    if (!reservaRepository.obtenerPorId(id)) {
        return null;
    }

    const {
        viviendaId,
        usuarioId,
        fechaInicio,
        fechaFin,
        estado
    } = datosReserva;

    if (
        !Number.isInteger(viviendaId) ||
        viviendaId <= 0 ||
        !Number.isInteger(usuarioId) ||
        usuarioId <= 0
    ) {
        throw new Error('Los identificadores no son válidos');
    }

    if (!viviendaRepository.obtenerPorId(viviendaId)) {
        throw new Error('La vivienda no existe');
    }

    const formatoFecha = /^\d{4}-\d{2}-\d{2}$/;

    if (
        typeof fechaInicio !== 'string' ||
        typeof fechaFin !== 'string' ||
        !formatoFecha.test(fechaInicio) ||
        !formatoFecha.test(fechaFin) ||
        !Number.isFinite(Date.parse(fechaInicio)) ||
        !Number.isFinite(Date.parse(fechaFin)) ||
        fechaInicio >= fechaFin
    ) {
        throw new Error('Las fechas no son válidas');
    }

    if (!['pendiente', 'confirmada', 'cancelada'].includes(estado)) {
        throw new Error('Estado no válido');
    }

    return reservaRepository.actualizar(id, {
        viviendaId,
        usuarioId,
        fechaInicio,
        fechaFin,
        estado
    });
};

const eliminar = (id) => {
    return reservaRepository.eliminar(id);
};



module.exports = { obtenerTodas, obtenerPorId, crear, actualizar, eliminar };
