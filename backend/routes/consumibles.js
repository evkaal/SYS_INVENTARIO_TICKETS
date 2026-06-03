const express = require('express');
const router = express.Router();
const Consumible = require('../models/Consumible');

const normalizar = (value) => String(value || '').trim().replace(/\s+/g, ' ');
const key = (value) => normalizar(value).toLowerCase();
const regexExacto = (value) => new RegExp(`^${normalizar(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

const construirPayload = (body = {}) => {
  const stockRecibido = body.stock ?? body.cantidad ?? 0;

  return {
    nombre: normalizar(body.nombre),
    categoria: normalizar(body.categoria),
    stock: Number(stockRecibido),
    unidad: normalizar(body.unidad || 'piezas'),
    descripcion: normalizar(body.descripcion),
    marca: normalizar(body.marca),
    ubicacionActual: normalizar(body.ubicacionActual),
    stockMinimo: Number(body.stockMinimo || 0),
    nombreKey: key(body.nombre)
  };
};

const validarPayload = (payload) => {
  if (!payload.nombre) return 'El nombre es requerido';
  if (!payload.categoria) return 'La categoría es requerida';
  if (!payload.unidad) return 'La unidad es requerida';

  if (Number.isNaN(payload.stock) || payload.stock < 0) {
    return 'La cantidad debe ser un número mayor o igual a 0';
  }

  return null;
};

const buscarDuplicado = async (nombre, idActual = null) => {
  const filtro = {
    $or: [
      { nombre: regexExacto(nombre) },
      { nombreKey: key(nombre) }
    ]
  };

  if (idActual) {
    filtro._id = { $ne: idActual };
  }

  return Consumible.findOne(filtro);
};

// Obtener todos los consumibles
router.get('/', async (req, res) => {
  try {
    const consumibles = await Consumible.find().sort({ nombre: 1 });
    res.json(consumibles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener un consumible por ID
router.get('/:id', async (req, res) => {
  try {
    const consumible = await Consumible.findById(req.params.id);
    if (!consumible) return res.status(404).json({ error: 'No existe' });
    res.json(consumible);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear consumible
router.post('/', async (req, res) => {
  try {
    const payload = construirPayload(req.body);
    const errorValidacion = validarPayload(payload);

    if (errorValidacion) {
      return res.status(400).json({ error: errorValidacion });
    }

    const existe = await buscarDuplicado(payload.nombre);
    if (existe) {
      return res.status(400).json({ error: 'Ya existe un consumible con ese nombre' });
    }

    const consumible = new Consumible(payload);
    await consumible.save();

    res.status(201).json({ message: 'Consumible creado', consumible });
  } catch (error) {
    console.error('Error creando consumible:', error);
    res.status(400).json({ error: error.message });
  }
});

// Actualizar consumible
router.put('/:id', async (req, res) => {
  try {
    const payload = construirPayload(req.body);
    const errorValidacion = validarPayload(payload);

    if (errorValidacion) {
      return res.status(400).json({ error: errorValidacion });
    }

    const duplicado = await buscarDuplicado(payload.nombre, req.params.id);
    if (duplicado) {
      return res.status(400).json({ error: 'Ya existe otro consumible con ese nombre' });
    }

    const consumible = await Consumible.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );

    if (!consumible) return res.status(404).json({ error: 'No existe' });
    res.json({ message: 'Consumible actualizado', consumible });
  } catch (error) {
    console.error('Error actualizando consumible:', error);
    res.status(400).json({ error: error.message });
  }
});

// Eliminar consumible
router.delete('/:id', async (req, res) => {
  try {
    const consumible = await Consumible.findByIdAndDelete(req.params.id);
    if (!consumible) return res.status(404).json({ error: 'No existe' });
    res.json({ message: 'Consumible eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
