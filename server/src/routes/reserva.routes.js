
const express = require('express');
const router = express.Router();

const reservaController = require('../controllers/reserva.controller');

router.get('/', reservaController.obtenerReservas);
router.get('/:id', reservaController.obtenerReservaPorId);
router.post('/', reservaController.crearReserva);
router.put('/:id', reservaController.actualizarReserva);
router.delete('/:id', reservaController.eliminarReserva);

module.exports = router;
