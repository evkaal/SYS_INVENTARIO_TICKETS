const express = require('express');
const router = express.Router();
const Dispositivo = require('../models/Dispositivo');

const normalizar = (value) => String(value || '').trim().replace(/\s+/g, ' ');
const key = (value) => normalizar(value).toLowerCase();
const regexExacto = (value) => new RegExp(`^${normalizar(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

const estadosValidos = ['Disponible', 'Ocupado', 'Prestado', 'No encontrado', 'Baja'];
const condicionesValidas = ['En funcionamiento', 'No funciona', 'En reparación'];

const normalizarEstado = (value) => estadosValidos.includes(value) ? value : 'Disponible';
const normalizarCondicion = (value) => condicionesValidas.includes(value) ? value : 'En funcionamiento';

const construirPayload = (body = {}) => {
  const ubicacion = normalizar(body.ubicacionActual || body.departamento);

  return {
    numeroDeInventario: normalizar(body.numeroDeInventario),
    inventarioKey: key(body.numeroDeInventario),
    tipo: normalizar(body.tipo),
    modelo: normalizar(body.modelo),
    marca: normalizar(body.marca),
    numeroSerie: normalizar(body.numeroSerie),
    serieKey: key(body.numeroSerie),
    estadoActual: normalizarEstado(body.estadoActual),
    condicion: normalizarCondicion(body.condicion),
    factura: normalizar(body.factura),
    departamento: ubicacion,
    ubicacionActual: ubicacion,
    observaciones: normalizar(body.observaciones),
    vale: normalizar(body.vale)
  };
};

const validarPayload = (payload) => {
  if (!payload.numeroDeInventario) return 'El número de inventario es requerido';
  if (!payload.tipo) return 'El tipo es requerido';
  if (!payload.modelo) return 'El modelo es requerido';
  if (!payload.marca) return 'La marca es requerida';
  if (!payload.numeroSerie) return 'El número de serie es requerido';
  return null;
};

const buscarDuplicadoInventario = async (numeroDeInventario, idActual = null) => {
  const filtro = {
    $or: [
      { numeroDeInventario: regexExacto(numeroDeInventario) },
      { inventarioKey: key(numeroDeInventario) }
    ]
  };

  if (idActual) filtro._id = { $ne: idActual };
  return Dispositivo.findOne(filtro);
};

const buscarDuplicadoSerie = async (numeroSerie, idActual = null) => {
  const filtro = {
    $or: [
      { numeroSerie: regexExacto(numeroSerie) },
      { serieKey: key(numeroSerie) }
    ]
  };

  if (idActual) filtro._id = { $ne: idActual };
  return Dispositivo.findOne(filtro);
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

    if (errorValidacion) {
      return res.status(400).json({ error: errorValidacion });
    }

    const existeInventario = await buscarDuplicadoInventario(payload.numeroDeInventario);
    if (existeInventario) {
      return res.status(400).json({ error: 'El número de inventario ya existe' });
    }

    const existeSerie = await buscarDuplicadoSerie(payload.numeroSerie);
    if (existeSerie) {
      return res.status(400).json({ error: 'El número de serie ya existe' });
    }

    const dispositivo = new Dispositivo(payload);
    await dispositivo.save();

    res.status(201).json({ message: 'Dispositivo creado', dispositivo });
  } catch (error) {
    console.error('Error creando dispositivo:', error);

    if (error.code === 11000) {
      return res.status(400).json({ error: 'Ya existe un dispositivo con ese número de inventario o serie' });
    }

    res.status(400).json({ error: error.message });
  }
});

// Actualizar dispositivo
router.put('/:id', async (req, res) => {
  try {
    const payload = construirPayload(req.body);
    const errorValidacion = validarPayload(payload);

    if (errorValidacion) {
      return res.status(400).json({ error: errorValidacion });
    }

    const duplicadoInventario = await buscarDuplicadoInventario(payload.numeroDeInventario, req.params.id);
    if (duplicadoInventario) {
      return res.status(400).json({ error: 'Ya existe otro dispositivo con ese número de inventario' });
    }

    const duplicadoSerie = await buscarDuplicadoSerie(payload.numeroSerie, req.params.id);
    if (duplicadoSerie) {
      return res.status(400).json({ error: 'Ya existe otro dispositivo con ese número de serie' });
    }

    const dispositivo = await Dispositivo.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );

    if (!dispositivo) return res.status(404).json({ error: 'No existe' });
    res.json({ message: 'Dispositivo actualizado', dispositivo });
  } catch (error) {
    console.error('Error actualizando dispositivo:', error);

    if (error.code === 11000) {
      return res.status(400).json({ error: 'Ya existe un dispositivo con ese número de inventario o serie' });
    }

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
    const ubicacion = normalizar(req.body.ubicacionActual || req.body.departamento);
    const update = {
      estadoActual: normalizarEstado(req.body.estadoActual),
      condicion: normalizarCondicion(req.body.condicion),
      fechaSalida: req.body.fechaSalida || null,
      vale: normalizar(req.body.vale)
    };

    if (ubicacion) {
      update.ubicacionActual = ubicacion;
      update.departamento = ubicacion;
    }

    const dispositivo = await Dispositivo.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );

    if (!dispositivo) return res.status(404).json({ error: 'No existe' });
    res.json({ message: 'Estado actualizado', dispositivo });
  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
