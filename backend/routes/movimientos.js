const express = require('express');
const router = express.Router();
const Movimiento = require('../models/Movimiento');
const Consumible = require('../models/Consumible');
const Dispositivo = require('../models/Dispositivo');

// Registrar movimiento (Entrada, Salida, Prestado)
router.post('/', async (req, res) => {
  try {
    const { materialId, dispositivoId, materialNombre, marca, tipo, cantidad, departamento, motivo, vale, ticketId, tecnico } = req.body;

    // Si es un consumible
    if (materialId) {
      const consumible = await Consumible.findById(materialId);
      if (!consumible) {
        return res.status(404).json({ error: 'Consumible no encontrado' });
      }

      if ((tipo === 'Salida' || tipo === 'Prestado') && consumible.stock < cantidad) {
        return res.status(400).json({ error: 'Stock insuficiente' });
      }

      if (tipo === 'Entrada') {
        consumible.stock += cantidad;
      } else if (tipo === 'Salida' || tipo === 'Prestado') {
        consumible.stock -= cantidad;
      }
      await consumible.save();
    }

    // Si es un dispositivo
    if (dispositivoId) {
      const dispositivo = await Dispositivo.findById(dispositivoId);
      if (!dispositivo) {
        return res.status(404).json({ error: 'Dispositivo no encontrado' });
      }

      if (tipo === 'Prestado' || tipo === 'Salida') {
        dispositivo.estadoActual = tipo === 'Prestado' ? 'Prestado' : 'Ocupado';
        dispositivo.fechaSalida = new Date();
        dispositivo.departamento = departamento;
        dispositivo.vale = vale;
        await dispositivo.save();
      } else if (tipo === 'Entrada') {
        dispositivo.estadoActual = 'Disponible';
        dispositivo.fechaSalida = null;
        await dispositivo.save();
      }
    }

    // Registrar movimiento
    const movimiento = new Movimiento({
      materialId: materialId || null,
      dispositivoId: dispositivoId || null,
      materialNombre,
      marca,
      tipo,
      cantidad: cantidad || 1,
      departamento,
      motivo,
      vale,
      ticketId,
      tecnico
    });
    await movimiento.save();

    res.status(201).json({ message: 'Movimiento registrado', movimiento });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obtener todos los movimientos
router.get('/', async (req, res) => {
  try {
    const movimientos = await Movimiento.find()
      .populate('materialId')
      .populate('dispositivoId')
      .sort({ fecha: -1 });
    res.json(movimientos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener movimientos por tipo
router.get('/tipo/:tipo', async (req, res) => {
  try {
    const movimientos = await Movimiento.find({ tipo: req.params.tipo })
      .populate('materialId')
      .populate('dispositivoId')
      .sort({ fecha: -1 });
    res.json(movimientos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;