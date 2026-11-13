
const usuarios = [];

let siguienteId = 1;

const buscarPorEmail = (email) => {
    return usuarios.find(usuario => usuario.email === email);
};

const buscarPorId = (id) => {
    return usuarios.find(usuario => usuario.id === id);
};

const crear = (datosUsuario) => {
    if (buscarPorEmail(datosUsuario.email)) throw new Error('El email ya está registrado');
    const nuevoUsuario = {
        id: siguienteId++,
        ...datosUsuario
    };

    usuarios.push(nuevoUsuario);

    return nuevoUsuario;
};

const actualizar = (id, datos) => {
    const usuario = buscarPorId(id);
    const duplicado = buscarPorEmail(datos.email);
    if (duplicado && duplicado.id !== id) throw new Error('El email ya está registrado');
    Object.assign(usuario, datos);
    return usuario;
};

module.exports = {
    buscarPorEmail,
    buscarPorId,
    crear,
    actualizar
};
