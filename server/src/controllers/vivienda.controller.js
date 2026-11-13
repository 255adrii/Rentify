
const viviendaService = require('../services/vivienda.service');

const obtenerViviendas = (req, res) => {
    const viviendas = viviendaService.obtenerTodas();

    res.json(viviendas);
};

const obtenerViviendaPorId = (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({ mensaje: 'ID no válido' });
    }

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

const actualizarVivienda = (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            mensaje: 'ID no válido'
        });
    }

    try {
        const vivienda = viviendaService.actualizar(id, req.body);

        if (!vivienda) {
            return res.status(404).json({
                mensaje: 'Vivienda no encontrada'
            });
        }

        res.json(vivienda);
    } catch (error) {
        res.status(400).json({
            mensaje: error.message
        });
    }
};

const eliminarVivienda = (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            mensaje: 'ID no válido'
        });
    }

    let eliminada;
    try {
        eliminada = viviendaService.eliminar(id);
    } catch (error) {
        return res.status(409).json({ mensaje: error.message });
    }

    if (!eliminada) {
        return res.status(404).json({
            mensaje: 'Vivienda no encontrada'
        });
    }

    res.status(200).json({
        mensaje: 'Vivienda eliminada correctamente'
    });
};





module.exports = { obtenerViviendas, obtenerViviendaPorId, crearVivienda, actualizarVivienda, eliminarVivienda };
