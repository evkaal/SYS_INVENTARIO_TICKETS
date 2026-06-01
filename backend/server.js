require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Importar rutas
const consumiblesRoutes = require('./routes/consumibles');
const dispositivosRoutes = require('./routes/dispositivos');
const movimientosRoutes = require('./routes/movimientos');
const consumoRoutes = require('./routes/consumo');
const prestamosRoutes = require('./routes/prestamos'); // ← Nueva ruta

const app = express();

// Configurar CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:4000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/consumibles', consumiblesRoutes);
app.use('/api/dispositivos', dispositivosRoutes);
app.use('/api/movimientos', movimientosRoutes);
app.use('/api/consumo', consumoRoutes);
app.use('/api/prestamos', prestamosRoutes); // ← Nueva ruta

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando' });
});

// Conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/inventario_tickets';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    console.log(`📀 Base de datos: ${mongoose.connection.name}`);
  })
  .catch(err => {
    console.error('❌ Error MongoDB:', err.message);
    process.exit(1);
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📡 Endpoints:`);
  console.log(`   GET    http://localhost:${PORT}/api/consumibles`);
  console.log(`   POST   http://localhost:${PORT}/api/consumibles`);
  console.log(`   GET    http://localhost:${PORT}/api/dispositivos`);
  console.log(`   POST   http://localhost:${PORT}/api/dispositivos`);
  console.log(`   GET    http://localhost:${PORT}/api/movimientos`);
  console.log(`   POST   http://localhost:${PORT}/api/movimientos`);
  console.log(`   POST   http://localhost:${PORT}/api/consumo/webhook`);
  console.log(`   GET    http://localhost:${PORT}/api/prestamos/activos`);
  console.log(`   GET    http://localhost:${PORT}/api/prestamos/historial`);
  console.log(`   POST   http://localhost:${PORT}/api/prestamos`);
});