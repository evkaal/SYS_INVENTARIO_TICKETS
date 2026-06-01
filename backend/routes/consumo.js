const express = require('express');
const router = express.Router();
const Movimiento = require('../models/Movimiento');
const Consumible = require('../models/Consumible');

// Webhook para recibir consumo desde sistema de tickets
router.post('/webhook', async (req, res) => {
  console.log('📨 Webhook recibido:', JSON.stringify(req.body, null, 2));
  
  const { ticket_id, tecnico, materiales } = req.body;

  // Validar datos recibidos
  if (!ticket_id) {
    return res.status(400).json({ error: 'ticket_id es requerido' });
  }
  
  if (!materiales || !Array.isArray(materiales) || materiales.length === 0) {
    return res.status(400).json({ error: 'materiales es requerido y debe ser un array no vacío' });
  }

  try {
    // 1. Validar disponibilidad de cada material
    for (const item of materiales) {
      const consumible = await Consumible.findOne({ nombre: item.nombre });
      
      if (!consumible) {
        return res.status(400).json({ 
          error: `Material "${item.nombre}" no encontrado en el inventario`,
          material: item.nombre
        });
      }
      
      if (consumible.stock < item.cantidad) {
        return res.status(400).json({ 
          error: `Stock insuficiente para "${item.nombre}". Disponible: ${consumible.stock} ${consumible.unidad}`,
          material: item.nombre,
          stockDisponible: consumible.stock,
          solicitado: item.cantidad
        });
      }
    }

    // 2. Descontar inventario y registrar movimientos
    const movimientosRegistrados = [];
    
    for (const item of materiales) {
      const consumible = await Consumible.findOne({ nombre: item.nombre });
      
      // Descontar stock
      consumible.stock -= item.cantidad;
      await consumible.save();
      
      // Registrar movimiento
      const movimiento = new Movimiento({
        materialId: consumible._id,
        materialNombre: consumible.nombre,
        marca: consumible.marca || '',
        tipo: 'Salida',
        cantidad: item.cantidad,
        motivo: `Consumo para ticket ${ticket_id}`,
        ticketId: ticket_id,
        tecnico: tecnico || 'Sistema',
        departamento: ''
      });
      
      await movimiento.save();
      movimientosRegistrados.push(movimiento);
      
      console.log(`✅ Descontado: ${item.cantidad} de ${consumible.nombre}. Nuevo stock: ${consumible.stock}`);
    }

    console.log(`✅ Consumo registrado exitosamente para ticket ${ticket_id}`);
    
    res.json({
      success: true,
      message: 'Consumo registrado exitosamente',
      ticket_id: ticket_id,
      materiales: materiales,
      movimientos: movimientosRegistrados.length
    });
    
  } catch (error) {
    console.error('❌ Error en webhook:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      detalle: error.message 
    });
  }
});

// Endpoint para verificar estado del webhook
router.get('/webhook/status', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Webhook endpoint funcionando correctamente',
    endpoints: {
      post: '/api/consumo/webhook',
      get: '/api/consumo/webhook/status'
    }
  });
});

module.exports = router;