const mongoose = require('mongoose');

const normalizeText = (value) => String(value || '').trim().replace(/\s+/g, ' ');
const toKey = (value) => normalizeText(value).toLowerCase();

const dispositivoSchema = new mongoose.Schema({
  numeroDeInventario: { type: String, required: true, trim: true },
  inventarioKey: { type: String, index: true },
  tipo: { type: String, required: true, trim: true },
  modelo: { type: String, required: true, trim: true },
  marca: { type: String, required: true, trim: true },
  numeroSerie: { type: String, required: true, trim: true },
  serieKey: { type: String, index: true },
  estadoActual: {
    type: String,
    enum: ['Disponible', 'Prestado', 'Baja'],
    default: 'Disponible'
  },
  condicion: {
    type: String,
    enum: ['En funcionamiento', 'No funciona', 'En reparación'],
    default: 'En funcionamiento'
  },
  fechaEntrada: { type: Date, default: Date.now },
  factura: { type: String, default: '', trim: true },
  fechaSalida: { type: Date, default: null },
  ubicacionActual: { type: String, default: '', trim: true },
  observaciones: { type: String, default: '', trim: true },
  vale: { type: String, default: '', trim: true }
}, { timestamps: true });

dispositivoSchema.pre('validate', function(next) {
  this.numeroDeInventario = normalizeText(this.numeroDeInventario);
  this.tipo = normalizeText(this.tipo);
  this.modelo = normalizeText(this.modelo);
  this.marca = normalizeText(this.marca);
  this.numeroSerie = normalizeText(this.numeroSerie);
  this.inventarioKey = toKey(this.numeroDeInventario);
  this.serieKey = toKey(this.numeroSerie);
  next();
});

module.exports = mongoose.model('Dispositivo', dispositivoSchema);
