
const usuarios = [];

let siguienteId = 1;

const buscarPorEmail = (email) => {
    return usuarios.find(usuario => usuario.email === email);
};

const buscarPorId = (id) => {
    return usuarios.find(usuario => usuario.id === id);
};

const crear = (datosUsuario) => {
    const nuevoUsuario = {
        id: siguienteId++,
        ...datosUsuario
    };

    usuarios.push(nuevoUsuario);

    return nuevoUsuario;
};

module.exports = {
    buscarPorEmail,
    buscarPorId,
    crear
};
