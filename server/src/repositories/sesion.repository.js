const sesiones = new Map();

const guardar = (token, sesion) => {
    for (const [clave, valor] of sesiones) {
        if (valor.expiraEn <= Date.now()) sesiones.delete(clave);
    }
    sesiones.set(token, sesion);
};

const obtener = token => {
    const sesion = sesiones.get(token);
    if (!sesion || sesion.expiraEn <= Date.now()) {
        sesiones.delete(token);
        return null;
    }
    return sesion;
};

const eliminar = token => sesiones.delete(token);

module.exports = { guardar, obtener, eliminar };
