
const express = require('express');
const router = express.Router();

const viviendaController = require('../controllers/vivienda.controller');

router.get('/', viviendaController.obtenerViviendas);
router.get('/:id', viviendaController.obtenerViviendaPorId);
router.post('/', viviendaController.crearVivienda);
router.put('/:id', viviendaController.actualizarVivienda);
router.delete('/:id', viviendaController.eliminarVivienda);

module.exports = router;
