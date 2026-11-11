
const viviendaRepository = require('../repositories/vivienda.repository');

const obtenerTodas = () => {
    return viviendaRepository.obtenerTodas();
};


const obtenerPorId = (id) => {
    return viviendaRepository.obtenerPorId(id);
};


const crear = (datosVivienda) => {
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



module.exports = { obtenerTodas,obtenerPorId, crear };
