const mongoose = require('mongoose');

const dispositivoSchema = new mongoose.Schema({
  numeroDeInventario: { type: String, required: true, unique: true },
  tipo: { type: String, required: true },
  modelo: { type: String, required: true },
  marca: { type: String, required: true },
  numeroSerie: { type: String, required: true, unique: true },
  estadoActual: { 
    type: String, 
    enum: ['Disponible', 'Ocupado', 'Prestado', 'No encontrado'],
    default: 'Disponible'
  },
  fechaEntrada: { type: Date, default: Date.now },
  factura: { type: String, default: '' },
  fechaSalida: { type: Date, default: null },
  departamento: { type: String, default: '' },
  observaciones: { type: String, default: '' },
  vale: { type: String, default: '' }
});

module.exports = mongoose.model('Dispositivo', dispositivoSchema);