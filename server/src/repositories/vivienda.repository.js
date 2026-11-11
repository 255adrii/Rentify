
const viviendas = [
    { id: 1, titulo: 'Piso en Madrid', precio: 950 },
    { id: 2, titulo: 'Apartamento en Móstoles', precio: 750 }
];

const obtenerTodas = () => {
    return viviendas;
};


const obtenerPorId = (id) => {
    return viviendas.find(vivienda => vivienda.id === id);
};

const crear = (datosVivienda) => {
    const nuevoId = viviendas.length > 0
        ? Math.max(...viviendas.map(vivienda => vivienda.id)) + 1
        : 1;

    const nuevaVivienda = {
        id: nuevoId,
        titulo: datosVivienda.titulo,
        precio: datosVivienda.precio
    };

    viviendas.push(nuevaVivienda);

    return nuevaVivienda;
};



module.exports = { obtenerTodas,obtenerPorId, crear };
