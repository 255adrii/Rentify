
const usuarioService = require('../services/usuario.service');

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
            usuario: usuario
        });
    } catch (error) {
        res.status(401).json({
            mensaje: error.message
        });
    }
};


module.exports = { registrar,login };
