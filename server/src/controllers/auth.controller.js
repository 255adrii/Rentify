
const usuarioService = require('../services/usuario.service');
const sesionService = require('../services/sesion.service');

const registrar = async (req, res) => {
    try {
        const nuevoUsuario = await usuarioService.registrar(req.body);

        res.status(201).json({
            mensaje: 'Usuario registrado correctamente',
            usuario: nuevoUsuario
        });
    } catch (error) {
        res.status(400).json({
            mensaje: error.message
        });
    }
};

const login = async (req, res) => {
    try {
        const usuario = await usuarioService.login(req.body);

        res.status(200).json({
            mensaje: 'Login correcto',
            usuario,
            token: sesionService.crear(usuario.id)
        });
    } catch (error) {
        res.status(401).json({
            mensaje: error.message
        });
    }
};


const actualizarPerfil = async (req, res) => {
    try {
        const usuario = await usuarioService.actualizarPerfil(req.usuario.id, req.body);
        res.json({ mensaje: 'Perfil actualizado', usuario });
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
};

const obtenerSesion = (req, res) => res.json({ usuario: req.usuario });
const cerrarSesion = (req, res) => {
    sesionService.eliminar(req.token);
    res.json({ mensaje: 'Sesión cerrada' });
};

module.exports = { registrar, login, actualizarPerfil, obtenerSesion, cerrarSesion };
