const express = require('express');
const router = express.Router();
const Movimiento = require('../models/Movimiento');
const Consumible = require('../models/Consumible');
const Dispositivo = require('../models/Dispositivo');

// Obtener todos los préstamos activos
router.get('/activos', async (req, res) => {
  try {
    const prestamos = await Movimiento.find({ 
      tipo: 'Prestamo', 
      fechaEntrada: null 
    }).sort({ fechaSalida: -1 });
    res.json(prestamos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener historial de préstamos
router.get('/historial', async (req, res) => {
  try {
    const prestamos = await Movimiento.find({ 
      tipo: { $in: ['Prestamo', 'Devolucion'] } 
    }).sort({ fechaSalida: -1 });
    res.json(prestamos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Registrar nuevo préstamo
router.post('/', async (req, res) => {
  try {
    const { 
      tipoMaterial, materialId, materialNombre, marca, responsable, lugar, 
      estadoMaterial, observacionesSalida, utilizadoEn, vale, tecnico 
    } = req.body;

    // Validar que se seleccionó un material
    if (!materialId) {
      return res.status(400).json({ error: 'Debe seleccionar un material' });
    }

    // Buscar el material según el tipo
    let material = null;
    if (tipoMaterial === 'consumible') {
      material = await Consumible.findById(materialId);
      if (!material) {
        return res.status(404).json({ error: 'Consumible no encontrado' });
      }
      if (material.stock < 1) {
        return res.status(400).json({ error: 'Stock insuficiente para prestar' });
      }
      // Descontar stock para consumible prestado
      material.stock -= 1;
      await material.save();
    } else if (tipoMaterial === 'dispositivo') {
      material = await Dispositivo.findById(materialId);
      if (!material) {
        return res.status(404).json({ error: 'Dispositivo no encontrado' });
      }
      if (material.estadoActual !== 'Disponible') {
        return res.status(400).json({ error: 'El dispositivo no está disponible' });
      }
      // Cambiar estado del dispositivo a Prestado
      material.estadoActual = 'Prestado';
      material.fechaSalida = new Date();
      material.departamento = lugar;
      material.vale = vale;
      await material.save();
    }

    // Crear registro de préstamo
    const prestamo = new Movimiento({
      materialId,
      tipoMaterial,
      materialNombre: materialNombre || material.nombre,
      marca: marca || material.marca || '',
      tipo: 'Prestamo',
      cantidad: 1,
      responsable,
      lugar,
      estadoMaterial,
      observacionesSalida,
      utilizadoEn,
      vale,
      tecnico,
      fechaSalida: new Date()
    });

    await prestamo.save();

    res.status(201).json({ 
      message: 'Préstamo registrado exitosamente', 
      prestamo 
    });

  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// Registrar devolución
router.put('/:id/devolucion', async (req, res) => {
  try {
    const { observacionesEntrada } = req.body;
    const prestamo = await Movimiento.findById(req.params.id);

    if (!prestamo) {
      return res.status(404).json({ error: 'Préstamo no encontrado' });
    }

    if (prestamo.fechaEntrada) {
      return res.status(400).json({ error: 'Este préstamo ya fue devuelto' });
    }

    // Actualizar el material según el tipo
    if (prestamo.tipoMaterial === 'consumible') {
      const consumible = await Consumible.findById(prestamo.materialId);
      if (consumible) {
        consumible.stock += 1; // Devolver stock
        await consumible.save();
      }
    } else if (prestamo.tipoMaterial === 'dispositivo') {
      const dispositivo = await Dispositivo.findById(prestamo.materialId);
      if (dispositivo) {
        dispositivo.estadoActual = 'Disponible';
        dispositivo.fechaSalida = null;
        await dispositivo.save();
      }
    }

    // Actualizar préstamo con fecha de entrada
    prestamo.fechaEntrada = new Date();
    prestamo.observacionesEntrada = observacionesEntrada;
    await prestamo.save();

    // Crear registro de devolución
    const devolucion = new Movimiento({
      materialId: prestamo.materialId,
      tipoMaterial: prestamo.tipoMaterial,
      materialNombre: prestamo.materialNombre,
      marca: prestamo.marca,
      tipo: 'Devolucion',
      cantidad: 1,
      responsable: prestamo.responsable,
      lugar: prestamo.lugar,
      utilizadoEn: prestamo.utilizadoEn,
      vale: prestamo.vale,
      tecnico: prestamo.tecnico,
      observacionesEntrada,
      fechaSalida: prestamo.fechaSalida,
      fechaEntrada: new Date()
    });
    await devolucion.save();

    res.json({ 
      message: 'Devolución registrada exitosamente', 
      prestamo 
    });

  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// Obtener materiales disponibles para préstamo
router.get('/materiales-disponibles', async (req, res) => {
  try {
    const consumibles = await Consumible.find({ stock: { $gt: 0 } })
      .select('_id nombre categoria marca stock unidad');
    
    const dispositivos = await Dispositivo.find({ estadoActual: 'Disponible' })
      .select('_id numeroDeInventario tipo modelo marca');

    const materiales = [
      ...consumibles.map(c => ({
        id: c._id,
        tipo: 'consumible',
        nombre: c.nombre,
        categoria: c.categoria,
        marca: c.marca,
        stock: c.stock,
        unidad: c.unidad,
        displayName: `${c.nombre} (Consumible - Stock: ${c.stock} ${c.unidad})`
      })),
      ...dispositivos.map(d => ({
        id: d._id,
        tipo: 'dispositivo',
        nombre: `${d.tipo} ${d.modelo}`,
        numeroInventario: d.numeroDeInventario,
        marca: d.marca,
        displayName: `${d.tipo} ${d.modelo} (${d.numeroDeInventario}) - ${d.marca}`
      }))
    ];

    res.json(materiales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener técnicos (responsables)
router.get('/tecnicos', async (req, res) => {
  try {
    // Obtener técnicos únicos de movimientos y tickets
    const tecnicosFromMovimientos = await Movimiento.distinct('tecnico');
    const tecnicos = tecnicosFromMovimientos.filter(t => t && t !== '');
    res.json(tecnicos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;