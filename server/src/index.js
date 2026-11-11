
const express = require('express');
const viviendaRoutes = require('./routes/vivienda.routes');

const app = express();
const PORT = 3000;

app.use(express.json());

// Ruta de prueba
app.get('/api', (req, res) => {
    res.json({ mensaje: 'API de Rentify funcionando' });
});

// Rutas de viviendas
app.use('/api/viviendas', viviendaRoutes);

app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});
