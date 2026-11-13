const express = require('express');
const cors = require('cors');
const viviendaRoutes = require('./routes/vivienda.routes');
const reservaRoutes = require('./routes/reserva.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:4200'
}));

// Ruta de prueba
app.get('/api', (req, res) => {
    res.json({ mensaje: 'API de Rentify funcionando' });
});

// Rutas de viviendas
app.use('/api/viviendas', viviendaRoutes);
app.use('/api/reservas', reservaRoutes);
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});
