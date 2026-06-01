const mongoose = require('mongoose');

const consumibleSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  categoria: { type: String, required: true },
  stock: { type: Number, default: 0, min: 0 },
  unidad: { type: String, required: true },
  descripcion: { type: String, default: '' },
  marca: { type: String, default: '' },
  ubicacionActual: { type: String, default: '' },
  stockMinimo: { type: Number, default: 10 },
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Consumible', consumibleSchema);