
const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const { autenticar } = require('../middleware/autenticacion');

router.post('/registro', authController.registrar);
router.post('/login', authController.login);
router.get('/me', autenticar, authController.obtenerSesion);
router.post('/logout', autenticar, authController.cerrarSesion);
router.put('/perfil', autenticar, authController.actualizarPerfil);

module.exports = router;
