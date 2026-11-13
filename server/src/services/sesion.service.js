const { randomBytes } = require('node:crypto');
const sesiones = require('../repositories/sesion.repository');
const usuarios = require('../repositories/usuario.repository');
const DURACION_SESION = 8 * 60 * 60 * 1000;

const crear = usuarioId => {
    const token = randomBytes(32).toString('hex');
    sesiones.guardar(token, { usuarioId, expiraEn: Date.now() + DURACION_SESION });
    return token;
};

const obtenerUsuario = token => {
    const sesion = sesiones.obtener(token);
    const usuario = sesion && usuarios.buscarPorId(sesion.usuarioId);
    if (!usuario) return null;
    // El rol y los datos proceden siempre del servidor, nunca del navegador.
    return { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol };
};

const eliminar = token => sesiones.eliminar(token);

module.exports = { crear, obtenerUsuario, eliminar };
