const mongoose = require('mongoose');

const prestamoSchema = new mongoose.Schema({
  materialId: { type: mongoose.Schema.Types.ObjectId, required: true },
  tipoMaterial: { type: String, enum: ['consumible', 'dispositivo'], required: true },
  materialNombre: { type: String, required: true, trim: true },
  marca: { type: String, default: '', trim: true },
  cantidad: { type: Number, default: 1, min: 1 },
  responsable: { type: String, required: true, trim: true },
  lugar: { type: String, required: true, trim: true },
  estadoMaterial: { type: String, default: 'Buen estado', trim: true },
  observacionesSalida: { type: String, default: '', trim: true },
  observacionesEntrada: { type: String, default: '', trim: true },
  utilizadoEn: { type: String, default: '', trim: true },
  vale: { type: String, default: '', trim: true },
  tecnico: { type: String, default: '', trim: true },
  fechaSalida: { type: Date, default: Date.now },
  fechaEntrada: { type: Date, default: null },
  estatus: { type: String, enum: ['Activo', 'Devuelto'], default: 'Activo' }
}, { timestamps: true });

module.exports = mongoose.model('Prestamo', prestamoSchema);
