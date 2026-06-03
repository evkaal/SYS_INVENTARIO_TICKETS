const express = require('express');
const router = express.Router();
const Prestamo = require('../models/Prestamo');
const Consumible = require('../models/Consumible');
const Dispositivo = require('../models/Dispositivo');

const normalizar = (value) => String(value || '').trim().replace(/\s+/g, ' ');
const dispositivoFunciona = (dispositivo) => {
  return !dispositivo.condicion || dispositivo.condicion === 'En funcionamiento';
};

// Obtener todos los préstamos activos
router.get('/activos', async (req, res) => {
  try {
    const prestamos = await Prestamo.find({ estatus: 'Activo', fechaEntrada: null }).sort({ fechaSalida: -1, createdAt: -1 });
    res.json(prestamos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener historial de préstamos
router.get('/historial', async (req, res) => {
  try {
    const prestamos = await Prestamo.find().sort({ fechaSalida: -1, createdAt: -1 });
    res.json(prestamos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Registrar nuevo préstamo
router.post('/', async (req, res) => {
  try {
    const {
      tipoMaterial,
      materialId,
      materialNombre,
      marca,
      responsable,
      autorizo,
      lugar,
      estadoMaterial,
      observacionesSalida,
      utilizadoEn,
      vale,
      tecnico
    } = req.body;

    if (!materialId) return res.status(400).json({ error: 'Debe seleccionar un material' });

    const responsableFinal = normalizar(responsable || autorizo || tecnico);
    const lugarFinal = normalizar(lugar);

    if (!responsableFinal) return res.status(400).json({ error: 'Debe indicar quién autoriza' });
    if (!lugarFinal) return res.status(400).json({ error: 'Debe indicar el lugar o área' });

    let material = null;

    if (tipoMaterial === 'consumible') {
      material = await Consumible.findById(materialId);
      if (!material) return res.status(404).json({ error: 'Consumible no encontrado' });
      if (material.stock < 1) return res.status(400).json({ error: 'Cantidad insuficiente para prestar' });

      material.stock -= 1;
      await material.save();
    } else if (tipoMaterial === 'dispositivo') {
      material = await Dispositivo.findById(materialId);
      if (!material) return res.status(404).json({ error: 'Dispositivo no encontrado' });
      if (material.estadoActual !== 'Disponible') return res.status(400).json({ error: 'El dispositivo no está disponible' });
      if (!dispositivoFunciona(material)) return res.status(400).json({ error: 'El dispositivo no está en funcionamiento' });

      material.estadoActual = 'Prestado';
      material.fechaSalida = new Date();
      material.ubicacionActual = lugarFinal;
      material.departamento = lugarFinal;
      material.vale = normalizar(vale);
      await material.save();
    } else {
      return res.status(400).json({ error: 'Tipo de material inválido' });
    }

    const prestamo = new Prestamo({
      materialId,
      tipoMaterial,
      materialNombre: materialNombre || material.nombre || `${material.tipo} ${material.modelo}`,
      marca: marca || material.marca || '',
      cantidad: 1,
      responsable: responsableFinal,
      lugar: lugarFinal,
      estadoMaterial: normalizar(estadoMaterial || 'Buen estado'),
      observacionesSalida: normalizar(observacionesSalida),
      utilizadoEn: normalizar(utilizadoEn),
      vale: normalizar(vale),
      tecnico: normalizar(tecnico),
      fechaSalida: new Date(),
      estatus: 'Activo'
    });

    await prestamo.save();
    res.status(201).json({ message: 'Préstamo registrado exitosamente', prestamo });
  } catch (error) {
    console.error('Error registrando préstamo:', error);
    res.status(400).json({ error: error.message });
  }
});

// Registrar devolución
router.put('/:id/devolucion', async (req, res) => {
  try {
    const { observacionesEntrada } = req.body;
    const prestamo = await Prestamo.findById(req.params.id);

    if (!prestamo) return res.status(404).json({ error: 'Préstamo no encontrado' });
    if (prestamo.fechaEntrada) return res.status(400).json({ error: 'Este préstamo ya fue devuelto' });

    if (prestamo.tipoMaterial === 'consumible') {
      const consumible = await Consumible.findById(prestamo.materialId);
      if (consumible) {
        consumible.stock += prestamo.cantidad || 1;
        await consumible.save();
      }
    }

    if (prestamo.tipoMaterial === 'dispositivo') {
      const dispositivo = await Dispositivo.findById(prestamo.materialId);
      if (dispositivo) {
        dispositivo.estadoActual = 'Disponible';
        dispositivo.fechaSalida = null;
        await dispositivo.save();
      }
    }

    prestamo.fechaEntrada = new Date();
    prestamo.observacionesEntrada = normalizar(observacionesEntrada);
    prestamo.estatus = 'Devuelto';
    await prestamo.save();

    res.json({ message: 'Devolución registrada exitosamente', prestamo });
  } catch (error) {
    console.error('Error registrando devolución:', error);
    res.status(400).json({ error: error.message });
  }
});

// Obtener materiales disponibles para préstamo
router.get('/materiales-disponibles', async (req, res) => {
  try {
    const consumibles = await Consumible.find({ stock: { $gt: 0 } }).select('_id nombre categoria marca stock unidad');
    const dispositivos = await Dispositivo.find({
      estadoActual: 'Disponible',
      $or: [
        { condicion: 'En funcionamiento' },
        { condicion: { $exists: false } },
        { condicion: '' },
        { condicion: null }
      ]
    }).select('_id numeroDeInventario tipo modelo marca condicion');

    const materiales = [
      ...consumibles.map(c => ({
        id: String(c._id),
        tipo: 'consumible',
        nombre: c.nombre,
        categoria: c.categoria,
        marca: c.marca,
        stock: c.stock,
        unidad: c.unidad,
        displayName: `${c.nombre} (Consumible - Cantidad: ${c.stock} ${c.unidad})`
      })),
      ...dispositivos.map(d => ({
        id: String(d._id),
        tipo: 'dispositivo',
        nombre: `${d.tipo} ${d.modelo}`,
        numeroInventario: d.numeroDeInventario,
        marca: d.marca,
        condicion: d.condicion || 'En funcionamiento',
        displayName: `${d.tipo} ${d.modelo} (${d.numeroDeInventario}) - ${d.marca}`
      }))
    ];

    res.json(materiales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener técnicos responsables
router.get('/tecnicos', async (req, res) => {
  try {
    const tecnicos = await Prestamo.distinct('tecnico');
    res.json(tecnicos.filter(t => t && t.trim() !== ''));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
