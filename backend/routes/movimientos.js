const express = require('express');
const router = express.Router();
const Movimiento = require('../models/Movimiento');
const Consumible = require('../models/Consumible');
const Dispositivo = require('../models/Dispositivo');

// Registrar movimiento. Solo se permiten Entrada y Salida.
router.post('/', async (req, res) => {
  try {
    const {
      materialId,
      dispositivoId,
      materialNombre,
      marca,
      tipo,
      cantidad,
      lugar,
      motivo,
      vale,
      ticketId,
      tecnico
    } = req.body;

    if (!['Entrada', 'Salida'].includes(tipo)) {
      return res.status(400).json({ error: 'El movimiento solo puede ser Entrada o Salida' });
    }

    const cantidadMovimiento = Number(cantidad || 1);
    if (Number.isNaN(cantidadMovimiento) || cantidadMovimiento <= 0) {
      return res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
    }

    let nombreFinal = materialNombre;
    let marcaFinal = marca || '';
    let tipoMaterial = '';

    // Consumible
    if (materialId) {
      const consumible = await Consumible.findById(materialId);
      if (!consumible) return res.status(404).json({ error: 'Consumible no encontrado' });

      if (tipo === 'Salida' && consumible.stock < cantidadMovimiento) {
        return res.status(400).json({ error: 'Cantidad insuficiente' });
      }

      consumible.stock = tipo === 'Entrada'
        ? consumible.stock + cantidadMovimiento
        : consumible.stock - cantidadMovimiento;
      await consumible.save();

      nombreFinal = consumible.nombre;
      marcaFinal = consumible.marca || '';
      tipoMaterial = 'consumible';
    }

    // Dispositivo
    if (dispositivoId) {
      const dispositivo = await Dispositivo.findById(dispositivoId);
      if (!dispositivo) return res.status(404).json({ error: 'Dispositivo no encontrado' });

      if (tipo === 'Salida') {
        dispositivo.estadoActual = 'Prestado';
        dispositivo.fechaSalida = new Date();
        dispositivo.ubicacionActual = lugar || dispositivo.ubicacionActual;
        dispositivo.vale = vale || dispositivo.vale;
      }

      if (tipo === 'Entrada') {
        dispositivo.estadoActual = 'Disponible';
        dispositivo.fechaSalida = null;
      }

      await dispositivo.save();

      nombreFinal = `${dispositivo.tipo} ${dispositivo.modelo}`;
      marcaFinal = dispositivo.marca || '';
      tipoMaterial = 'dispositivo';
    }

    if (!materialId && !dispositivoId) {
      return res.status(400).json({ error: 'Debe seleccionar un consumible o un dispositivo' });
    }

    const movimiento = new Movimiento({
      materialId: materialId || null,
      dispositivoId: dispositivoId || null,
      materialNombre: nombreFinal,
      tipoMaterial,
      marca: marcaFinal,
      tipo,
      cantidad: cantidadMovimiento,
      lugar: lugar || '',
      observacionesEntrada: tipo === 'Entrada' ? (motivo || '') : '',
      observacionesSalida: tipo === 'Salida' ? (motivo || '') : '',
      vale: vale || '',
      ticketId: ticketId || null,
      tecnico: tecnico || null,
      fechaEntrada: tipo === 'Entrada' ? new Date() : null,
      fechaSalida: tipo === 'Salida' ? new Date() : null,
      fecha: new Date()
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
      .sort({ fecha: -1, createdAt: -1 });
    res.json(movimientos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener movimientos por tipo
router.get('/tipo/:tipo', async (req, res) => {
  try {
    if (!['Entrada', 'Salida'].includes(req.params.tipo)) {
      return res.status(400).json({ error: 'El tipo solo puede ser Entrada o Salida' });
    }

    const movimientos = await Movimiento.find({ tipo: req.params.tipo })
      .populate('materialId')
      .populate('dispositivoId')
      .sort({ fecha: -1, createdAt: -1 });
    res.json(movimientos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
