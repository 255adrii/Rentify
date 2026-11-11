
const viviendaService = require('../services/vivienda.service');

const obtenerViviendas = (req, res) => {
    const viviendas = viviendaService.obtenerTodas();

    res.json(viviendas);
};

const obtenerViviendaPorId = (req, res) => {
    const id = Number(req.params.id);

    const vivienda = viviendaService.obtenerPorId(id);

    if (!vivienda) {
        return res.status(404).json({
            mensaje: 'Vivienda no encontrada'
        });
    }

    res.json(vivienda);
};

const crearVivienda = (req, res) => {
    try {
        const nuevaVivienda = viviendaService.crear(req.body);

        res.status(201).json(nuevaVivienda);
    } catch (error) {
        res.status(400).json({
            mensaje: error.message
        });
    }
};



module.exports = { obtenerViviendas, obtenerViviendaPorId, crearVivienda };
