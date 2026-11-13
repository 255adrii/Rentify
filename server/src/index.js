const express = require('express');
const cors = require('cors');
const viviendaRoutes = require('./routes/vivienda.routes');
const reservaRoutes = require('./routes/reserva.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors({
    origin: 'http://localhost:4200'
}));
app.use(express.json());

// Ruta de prueba
app.get('/api', (req, res) => {
    res.json({ mensaje: 'API de Rentify funcionando' });
});

// Rutas de viviendas
app.use('/api/viviendas', viviendaRoutes);
app.use('/api/reservas', reservaRoutes);
app.use('/api/auth', authRoutes);

app.use((req, res) => res.status(404).json({ mensaje: 'Ruta no encontrada' }));

app.use((error, req, res, next) => {
    if (error.type === 'entity.parse.failed') {
        return res.status(400).json({ mensaje: 'El cuerpo debe contener JSON válido' });
    }
    if (error.type === 'entity.too.large') {
        return res.status(413).json({ mensaje: 'El cuerpo de la petición es demasiado grande' });
    }
    res.status(500).json({ mensaje: 'Error interno del servidor' });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Servidor funcionando en http://localhost:${PORT}`);
    });
}

module.exports = app;
