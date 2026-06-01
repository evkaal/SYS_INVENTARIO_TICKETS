const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 4000;

const INVENTARIO_WEBHOOK_URL = 'http://localhost:3000/api/consumo/webhook';

app.use(cors());
app.use(express.json());

let ticketsDB = [
  {
    id: 'TCK-1001',
    tecnico: 'Juan Pérez',
    descripcion: 'Mantenimiento preventivo en sala de servidores',
    estado: 'abierto',
    fecha: new Date().toISOString().split('T')[0],
    materialesUtilizados: null
  }
];

let nextId = 1002;

app.get('/api/tickets', (req, res) => {
  res.json(ticketsDB);
});

app.get('/api/tickets/:id', (req, res) => {
  const ticket = ticketsDB.find(t => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });
  res.json(ticket);
});

app.post('/api/tickets', (req, res) => {
  const newTicket = {
    id: `TCK-${nextId++}`,
    tecnico: req.body.tecnico,
    descripcion: req.body.descripcion,
    estado: 'abierto',
    fecha: new Date().toISOString().split('T')[0],
    materialesUtilizados: null
  };
  ticketsDB.push(newTicket);
  console.log(`✅ Ticket creado: ${newTicket.id}`);
  res.status(201).json(newTicket);
});

app.post('/api/tickets/:id/finalizar', async (req, res) => {
  const ticket = ticketsDB.find(t => t.id === req.params.id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket no encontrado' });
  }

  const { materiales } = req.body;

  if (!materiales || materiales.length === 0) {
    return res.status(400).json({ error: 'Debe especificar materiales' });
  }

  console.log(`\n📨 Ticket ${ticket.id}: Enviando consumo al inventario...`);
  console.log('Materiales:', JSON.stringify(materiales, null, 2));

  try {
    const response = await axios.post(INVENTARIO_WEBHOOK_URL, {
      ticket_id: ticket.id,
      tecnico: ticket.tecnico,
      materiales: materiales
    });

    ticket.estado = 'completado';
    ticket.materialesUtilizados = materiales;
    ticket.fechaCierre = new Date().toISOString();

    console.log('✅ Respuesta del inventario:', response.data);
    
    res.json({
      message: 'Consumo registrado exitosamente',
      ticket: ticket,
      inventarioResponse: response.data
    });

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    
    res.status(400).json({
      error: 'No se pudo registrar el consumo',
      detalle: error.response?.data?.error || error.message
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', tickets: ticketsDB.length });
});

app.listen(PORT, () => {
  console.log(`🎫 Sistema de Tickets Simulado`);
  console.log(`📡 Servidor: http://localhost:${PORT}`);
  console.log(`🔗 Webhook: ${INVENTARIO_WEBHOOK_URL}`);
});