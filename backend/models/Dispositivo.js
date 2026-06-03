const mongoose = require('mongoose');

const normalizeText = (value) => String(value || '').trim().replace(/\s+/g, ' ');
const toKey = (value) => normalizeText(value).toLowerCase();

const estadosValidos = ['Disponible', 'Ocupado', 'Prestado', 'No encontrado', 'Baja'];
const condicionesValidas = ['En funcionamiento', 'No funciona', 'En reparación'];

const dispositivoSchema = new mongoose.Schema({
  numeroDeInventario: { type: String, required: true, trim: true, unique: true },
  inventarioKey: { type: String, index: true },
  tipo: { type: String, required: true, trim: true },
  modelo: { type: String, required: true, trim: true },
  marca: { type: String, required: true, trim: true },
  numeroSerie: { type: String, required: true, trim: true, unique: true },
  serieKey: { type: String, index: true },
  estadoActual: {
    type: String,
    enum: estadosValidos,
    default: 'Disponible'
  },
  condicion: {
    type: String,
    enum: condicionesValidas,
    default: 'En funcionamiento'
  },
  fechaEntrada: { type: Date, default: Date.now },
  factura: { type: String, default: '', trim: true },
  fechaSalida: { type: Date, default: null },
  departamento: { type: String, default: '', trim: true },
  ubicacionActual: { type: String, default: '', trim: true },
  observaciones: { type: String, default: '', trim: true },
  vale: { type: String, default: '', trim: true }
}, { timestamps: true });

dispositivoSchema.pre('validate', function() {
  this.numeroDeInventario = normalizeText(this.numeroDeInventario);
  this.tipo = normalizeText(this.tipo);
  this.modelo = normalizeText(this.modelo);
  this.marca = normalizeText(this.marca);
  this.numeroSerie = normalizeText(this.numeroSerie);
  this.factura = normalizeText(this.factura);
  this.observaciones = normalizeText(this.observaciones);
  this.vale = normalizeText(this.vale);

  const ubicacion = normalizeText(this.ubicacionActual || this.departamento);
  this.ubicacionActual = ubicacion;
  this.departamento = ubicacion;

  if (!estadosValidos.includes(this.estadoActual)) {
    this.estadoActual = 'Disponible';
  }

  if (!condicionesValidas.includes(this.condicion)) {
    this.condicion = 'En funcionamiento';
  }

  this.inventarioKey = toKey(this.numeroDeInventario);
  this.serieKey = toKey(this.numeroSerie);
});

module.exports = mongoose.model('Dispositivo', dispositivoSchema);
