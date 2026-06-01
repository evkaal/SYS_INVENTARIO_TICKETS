const express = require('express');
const router = express.Router();
const Consumible = require('../models/Consumible');

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
    const { nombre, categoria, stock, unidad, descripcion, marca, ubicacionActual, stockMinimo } = req.body;
    
    const existe = await Consumible.findOne({ nombre });
    if (existe) {
      return res.status(400).json({ error: 'El consumible ya existe' });
    }
    
    const consumible = new Consumible({ nombre, categoria, stock, unidad, descripcion, marca, ubicacionActual, stockMinimo });
    await consumible.save();
    res.status(201).json({ message: 'Consumible creado', consumible });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Actualizar consumible
router.put('/:id', async (req, res) => {
  try {
    const consumible = await Consumible.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!consumible) return res.status(404).json({ error: 'No existe' });
    res.json({ message: 'Consumible actualizado', consumible });
  } catch (error) {
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