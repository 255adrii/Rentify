
const express = require('express');
const router = express.Router();

const viviendaController = require('../controllers/vivienda.controller');
const { autenticar, requiereAdmin, validarId } = require('../middleware/autenticacion');

router.use(autenticar);
router.param('id', validarId);

router.get('/', viviendaController.obtenerViviendas);
router.get('/:id', viviendaController.obtenerViviendaPorId);
router.post('/', requiereAdmin, viviendaController.crearVivienda);
router.put('/:id', requiereAdmin, viviendaController.actualizarVivienda);
router.delete('/:id', requiereAdmin, viviendaController.eliminarVivienda);

module.exports = router;
