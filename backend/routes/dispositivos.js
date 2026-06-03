const express = require('express');
const router = express.Router();
const Dispositivo = require('../models/Dispositivo');

const normalizar = (value) => String(value || '').trim().replace(/\s+/g, ' ');
const key = (value) => normalizar(value).toLowerCase();

const construirPayload = (body) => ({
  numeroDeInventario: normalizar(body.numeroDeInventario),
  tipo: normalizar(body.tipo),
  modelo: normalizar(body.modelo),
  marca: normalizar(body.marca),
  numeroSerie: normalizar(body.numeroSerie),
  estadoActual: body.estadoActual || 'Disponible',
  condicion: body.condicion || 'En funcionamiento',
  factura: normalizar(body.factura),
  ubicacionActual: normalizar(body.ubicacionActual || body.departamento),
  observaciones: normalizar(body.observaciones),
  vale: normalizar(body.vale)
});

const validarPayload = (payload) => {
  if (!payload.numeroDeInventario) return 'El número de inventario es requerido';
  if (!payload.tipo) return 'El tipo es requerido';
  if (!payload.modelo) return 'El modelo es requerido';
  if (!payload.marca) return 'La marca es requerida';
  if (!payload.numeroSerie) return 'El número de serie es requerido';
  return null;
};

// Obtener todos los dispositivos
router.get('/', async (req, res) => {
  try {
    const dispositivos = await Dispositivo.find().sort({ numeroDeInventario: 1 });
    res.json(dispositivos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener un dispositivo por ID
router.get('/:id', async (req, res) => {
  try {
    const dispositivo = await Dispositivo.findById(req.params.id);
    if (!dispositivo) return res.status(404).json({ error: 'No existe' });
    res.json(dispositivo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear dispositivo
router.post('/', async (req, res) => {
  try {
    const payload = construirPayload(req.body);
    const errorValidacion = validarPayload(payload);
    if (errorValidacion) return res.status(400).json({ error: errorValidacion });

    const existeInventario = await Dispositivo.findOne({ inventarioKey: key(payload.numeroDeInventario) });
    if (existeInventario) {
      return res.status(400).json({ error: 'El número de inventario ya existe' });
    }

    const existeSerie = await Dispositivo.findOne({ serieKey: key(payload.numeroSerie) });
    if (existeSerie) {
      return res.status(400).json({ error: 'El número de serie ya existe' });
    }

    const dispositivo = new Dispositivo(payload);
    await dispositivo.save();
    res.status(201).json({ message: 'Dispositivo creado', dispositivo });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Actualizar dispositivo
router.put('/:id', async (req, res) => {
  try {
    const payload = construirPayload(req.body);
    const errorValidacion = validarPayload(payload);
    if (errorValidacion) return res.status(400).json({ error: errorValidacion });

    const duplicadoInventario = await Dispositivo.findOne({
      inventarioKey: key(payload.numeroDeInventario),
      _id: { $ne: req.params.id }
    });
    if (duplicadoInventario) {
      return res.status(400).json({ error: 'Ya existe otro dispositivo con ese número de inventario' });
    }

    const duplicadoSerie = await Dispositivo.findOne({
      serieKey: key(payload.numeroSerie),
      _id: { $ne: req.params.id }
    });
    if (duplicadoSerie) {
      return res.status(400).json({ error: 'Ya existe otro dispositivo con ese número de serie' });
    }

    const dispositivo = await Dispositivo.findByIdAndUpdate(
      req.params.id,
      {
        ...payload,
        inventarioKey: key(payload.numeroDeInventario),
        serieKey: key(payload.numeroSerie)
      },
      { new: true, runValidators: true }
    );

    if (!dispositivo) return res.status(404).json({ error: 'No existe' });
    res.json({ message: 'Dispositivo actualizado', dispositivo });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Eliminar dispositivo
router.delete('/:id', async (req, res) => {
  try {
    const dispositivo = await Dispositivo.findByIdAndDelete(req.params.id);
    if (!dispositivo) return res.status(404).json({ error: 'No existe' });
    res.json({ message: 'Dispositivo eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar estado de dispositivo
router.patch('/:id/estado', async (req, res) => {
  try {
    const { estadoActual, condicion, fechaSalida, ubicacionActual, vale } = req.body;
    const dispositivo = await Dispositivo.findByIdAndUpdate(
      req.params.id,
      { estadoActual, condicion, fechaSalida, ubicacionActual, vale },
      { new: true, runValidators: true }
    );
    if (!dispositivo) return res.status(404).json({ error: 'No existe' });
    res.json({ message: 'Estado actualizado', dispositivo });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
