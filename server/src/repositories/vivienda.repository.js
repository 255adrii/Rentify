
const viviendas = [
    { id: 1, titulo: 'Piso en Madrid', precio: 950 },
    { id: 2, titulo: 'Apartamento en Móstoles', precio: 750 }
];
let siguienteId = 3;

const obtenerTodas = () => {
    return viviendas;
};


const obtenerPorId = (id) => {
    return viviendas.find(vivienda => vivienda.id === id);
};

const crear = (datosVivienda) => {
    const nuevaVivienda = {
        id: siguienteId++,
        titulo: datosVivienda.titulo,
        precio: datosVivienda.precio
    };

    viviendas.push(nuevaVivienda);

    return nuevaVivienda;
};

const actualizar = (id, datosVivienda) => {
    const vivienda = viviendas.find(v => v.id === id);

    if (!vivienda) {
        return null;
    }

    vivienda.titulo = datosVivienda.titulo;
    vivienda.precio = datosVivienda.precio;

    return vivienda;
};

const eliminar = (id) => {
    const indice = viviendas.findIndex(vivienda => vivienda.id === id);

    if (indice === -1) {
        return false;
    }

    viviendas.splice(indice, 1);

    return true;
};





module.exports = { obtenerTodas,obtenerPorId, crear, actualizar, eliminar };
