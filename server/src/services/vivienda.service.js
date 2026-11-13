
const viviendaRepository = require('../repositories/vivienda.repository');

const obtenerTodas = () => {
    return viviendaRepository.obtenerTodas();
};


const obtenerPorId = (id) => {
    return viviendaRepository.obtenerPorId(id);
};


const crear = (datosVivienda) => {
    datosVivienda = datosVivienda || {};
    if (
        typeof datosVivienda.titulo !== 'string' ||
        datosVivienda.titulo.trim() === '' ||
        typeof datosVivienda.precio !== 'number' ||
        !Number.isFinite(datosVivienda.precio) ||
        datosVivienda.precio <= 0
    ) {
        throw new Error('Datos de vivienda no válidos');
    }

    return viviendaRepository.crear({
        titulo: datosVivienda.titulo.trim(),
        precio: datosVivienda.precio
    });
};

const actualizar = (id, datosVivienda) => {
    if (!viviendaRepository.obtenerPorId(id)) return null;
    datosVivienda = datosVivienda || {};
    if (
        typeof datosVivienda.titulo !== 'string' ||
        datosVivienda.titulo.trim() === '' ||
        typeof datosVivienda.precio !== 'number' ||
        !Number.isFinite(datosVivienda.precio) ||
        datosVivienda.precio <= 0
    ) {
        throw new Error('Datos de vivienda no válidos');
    }

    return viviendaRepository.actualizar(id, {
        titulo: datosVivienda.titulo.trim(),
        precio: datosVivienda.precio
    });
};

const eliminar = (id) => {
    const reservas = require('../repositories/reserva.repository').obtenerTodas();
    if (reservas.some(reserva => reserva.viviendaId === id)) {
        throw new Error('Elimina primero las reservas asociadas a esta vivienda');
    }
    return viviendaRepository.eliminar(id);
};





module.exports = { obtenerTodas,obtenerPorId, crear, actualizar, eliminar };
