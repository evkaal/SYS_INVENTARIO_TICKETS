const express = require('express');
const router = express.Router();
const Dispositivo = require('../models/Dispositivo');

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
    const { numeroDeInventario, tipo, modelo, marca, numeroSerie, estadoActual, factura, departamento, observaciones } = req.body;
    
    const existeInventario = await Dispositivo.findOne({ numeroDeInventario });
    if (existeInventario) {
      return res.status(400).json({ error: 'El número de inventario ya existe' });
    }
    
    const existeSerie = await Dispositivo.findOne({ numeroSerie });
    if (existeSerie) {
      return res.status(400).json({ error: 'El número de serie ya existe' });
    }
    
    const dispositivo = new Dispositivo({ 
      numeroDeInventario, tipo, modelo, marca, numeroSerie, estadoActual, 
      factura, departamento, observaciones 
    });
    await dispositivo.save();
    res.status(201).json({ message: 'Dispositivo creado', dispositivo });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Actualizar dispositivo
router.put('/:id', async (req, res) => {
  try {
    const dispositivo = await Dispositivo.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
    const { estadoActual, fechaSalida, departamento, vale } = req.body;
    const dispositivo = await Dispositivo.findByIdAndUpdate(
      req.params.id, 
      { estadoActual, fechaSalida, departamento, vale }, 
      { new: true }
    );
    if (!dispositivo) return res.status(404).json({ error: 'No existe' });
    res.json({ message: 'Estado actualizado', dispositivo });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;