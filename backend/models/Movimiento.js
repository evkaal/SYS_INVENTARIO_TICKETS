const mongoose = require('mongoose');

const movimientoSchema = new mongoose.Schema({
  materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Consumible', required: false },
  dispositivoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dispositivo', required: false },
  materialNombre: { type: String, required: true },
  tipoMaterial: { type: String, enum: ['consumible', 'dispositivo'], required: true },
  marca: { type: String, default: '' },
  tipo: { 
    type: String, 
    enum: ['Entrada', 'Salida', 'Prestamo', 'Devolucion'],
    required: true 
  },
  cantidad: { type: Number, default: 1 },
  responsable: { type: String, default: '' },
  lugar: { type: String, default: '' },
  estadoMaterial: { type: String, default: 'Buen estado' },
  observacionesSalida: { type: String, default: '' },
  observacionesEntrada: { type: String, default: '' },
  fechaSalida: { type: Date, default: Date.now },
  fechaEntrada: { type: Date, default: null },
  utilizadoEn: { type: String, default: '' },
  vale: { type: String, default: '' },
  ticketId: { type: String, default: null },
  tecnico: { type: String, default: null }
});

module.exports = mongoose.model('Movimiento', movimientoSchema);