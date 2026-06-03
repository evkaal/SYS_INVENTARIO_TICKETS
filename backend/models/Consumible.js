const mongoose = require('mongoose');

const normalizeText = (value) => String(value || '').trim().replace(/\s+/g, ' ');
const toKey = (value) => normalizeText(value).toLowerCase();

const consumibleSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  nombreKey: { type: String, index: true },
  categoria: { type: String, required: true, trim: true },
  stock: { type: Number, default: 0, min: 0 },
  unidad: { type: String, required: true, trim: true },
  descripcion: { type: String, default: '', trim: true },
  marca: { type: String, default: '', trim: true },
  ubicacionActual: { type: String, default: '', trim: true },
  stockMinimo: { type: Number, default: 0, min: 0 },
  fecha: { type: Date, default: Date.now }
}, { timestamps: true });

consumibleSchema.pre('validate', function(next) {
  this.nombre = normalizeText(this.nombre);
  this.categoria = normalizeText(this.categoria);
  this.unidad = normalizeText(this.unidad);
  this.nombreKey = toKey(this.nombre);
  next();
});

module.exports = mongoose.model('Consumible', consumibleSchema);
