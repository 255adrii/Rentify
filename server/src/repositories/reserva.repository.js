
// Las reservas se crean con usuarios registrados desde la aplicación.
const reservas = [];
let siguienteId = 1;

const obtenerTodas = () => {
    return reservas;
};

const obtenerPorId = (id) => {
    return reservas.find(reserva => reserva.id === id);
};

const crear = (datosReserva) => {
    const nuevaReserva = {
        ...datosReserva,
        id: siguienteId++
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
