const express = require('express');
const router = express.Router();
const Movimiento = require('../models/Movimiento');
const Consumible = require('../models/Consumible');
const Dispositivo = require('../models/Dispositivo');

const normalizar = (value) => String(value || '').trim().replace(/\s+/g, ' ');

// Registrar movimiento. En esta sección solo se permiten Entrada y Salida.
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
      departamento,
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

    const lugarFinal = normalizar(lugar || departamento);
    let nombreFinal = normalizar(materialNombre);
    let marcaFinal = normalizar(marca);
    let tipoMaterial = '';

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

    if (dispositivoId) {
      const dispositivo = await Dispositivo.findById(dispositivoId);
      if (!dispositivo) return res.status(404).json({ error: 'Dispositivo no encontrado' });

      if (cantidadMovimiento !== 1) {
        return res.status(400).json({ error: 'Para dispositivos la cantidad debe ser 1' });
      }

      if (tipo === 'Salida') {
        dispositivo.estadoActual = 'Ocupado';
        dispositivo.fechaSalida = new Date();
        dispositivo.ubicacionActual = lugarFinal || dispositivo.ubicacionActual || dispositivo.departamento || '';
        dispositivo.departamento = dispositivo.ubicacionActual;
        dispositivo.vale = normalizar(vale || dispositivo.vale);
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
      lugar: lugarFinal,
      departamento: lugarFinal,
      observacionesEntrada: tipo === 'Entrada' ? normalizar(motivo) : '',
      observacionesSalida: tipo === 'Salida' ? normalizar(motivo) : '',
      vale: normalizar(vale),
      ticketId: ticketId || null,
      tecnico: tecnico || null,
      fechaEntrada: tipo === 'Entrada' ? new Date() : null,
      fechaSalida: tipo === 'Salida' ? new Date() : null,
      fecha: new Date()
    });

    await movimiento.save();
    res.status(201).json({ message: 'Movimiento registrado', movimiento });
  } catch (error) {
    console.error('Error registrando movimiento:', error);
    res.status(400).json({ error: error.message });
  }
});

// Obtener todos los movimientos. Se muestran solo Entrada y Salida para evitar confusión con préstamos.
router.get('/', async (req, res) => {
  try {
    const movimientos = await Movimiento.find({ tipo: { $in: ['Entrada', 'Salida'] } })
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
