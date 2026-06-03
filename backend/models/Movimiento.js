const mongoose = require('mongoose');

const movimientoSchema = new mongoose.Schema({
  materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Consumible', required: false },
  dispositivoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dispositivo', required: false },
  materialNombre: { type: String, required: true, trim: true },
  tipoMaterial: { type: String, enum: ['consumible', 'dispositivo'], required: true },
  marca: { type: String, default: '', trim: true },
  tipo: {
    type: String,
    enum: ['Entrada', 'Salida'],
    required: true
  },
  cantidad: { type: Number, default: 1, min: 1 },
  responsable: { type: String, default: '', trim: true },
  lugar: { type: String, default: '', trim: true },
  estadoMaterial: { type: String, default: 'Buen estado', trim: true },
  observacionesSalida: { type: String, default: '', trim: true },
  observacionesEntrada: { type: String, default: '', trim: true },
  fechaSalida: { type: Date, default: null },
  fechaEntrada: { type: Date, default: null },
  fecha: { type: Date, default: Date.now },
  utilizadoEn: { type: String, default: '', trim: true },
  vale: { type: String, default: '', trim: true },
  ticketId: { type: String, default: null },
  tecnico: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Movimiento', movimientoSchema);
