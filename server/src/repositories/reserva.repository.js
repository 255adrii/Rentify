
const reservas = [
    {
        id: 1,
        viviendaId: 1,
        usuarioId: 1,
        fechaInicio: '2026-12-01',
        fechaFin: '2026-12-10',
        estado: 'pendiente'
    }
];

const obtenerTodas = () => {
    return reservas;
};

const obtenerPorId = (id) => {
    return reservas.find(reserva => reserva.id === id);
};

const crear = (datosReserva) => {
    const nuevoId = reservas.length > 0
        ? Math.max(...reservas.map(reserva => reserva.id)) + 1
        : 1;

    const nuevaReserva = {
        id: nuevoId,
        ...datosReserva
    };

    reservas.push(nuevaReserva);

    return nuevaReserva;
};

const actualizar = (id, datosReserva) => {
    const reserva = reservas.find(r => r.id === id);

    if (!reserva) {
        return null;
    }

    Object.assign(reserva, datosReserva);

    return reserva;
};

const eliminar = (id) => {
    const indice = reservas.findIndex(r => r.id === id);

    if (indice === -1) {
        return false;
    }

    reservas.splice(indice, 1);

    return true;
};



module.exports = { obtenerTodas, obtenerPorId, crear, actualizar, eliminar };
