const axios = require('axios');

const TICKETS_API = 'http://localhost:4000/api';
const INVENTARIO_API = 'http://localhost:3000/api';

async function probarIntegracionCompleta() {
  console.log('🚀 Iniciando prueba de integración completa\n');

  try {
    // 1. Crear materiales de prueba en inventario
    console.log('1️⃣ Creando materiales en inventario...');
    const materialesPrueba = [
      { nombre: 'Cable UTP', categoria: 'Cables', stock: 100, unidad: 'metros', stockMinimo: 10 },
      { nombre: 'Conector RJ45', categoria: 'Conectores', stock: 500, unidad: 'piezas', stockMinimo: 50 }
    ];

    for (const material of materialesPrueba) {
      try {
        await axios.post(`${INVENTARIO_API}/inventario/materiales`, material);
        console.log(`   ✅ ${material.nombre} creado`);
      } catch (err) {
        if (err.response?.status === 400) {
          console.log(`   ⚠️ ${material.nombre} ya existe`);
        }
      }
    }

    // 2. Ver inventario inicial
    console.log('\n2️⃣ Consultando inventario inicial...');
    const inventarioRes = await axios.get(`${INVENTARIO_API}/inventario/materiales`);
    console.log('   Stock actual:');
    inventarioRes.data.forEach(m => {
      console.log(`     - ${m.nombre}: ${m.stock} ${m.unidad}`);
    });

    // 3. Crear un ticket
    console.log('\n3️⃣ Creando ticket de mantenimiento...');
    const ticketRes = await axios.post(`${TICKETS_API}/tickets`, {
      tecnico: 'Carlos Ruiz',
      descripcion: 'Mantenimiento de red en laboratorio',
      estado: 'abierto'
    });
    const ticket = ticketRes.data;
    console.log(`   ✅ Ticket creado: ${ticket.id} - Técnico: ${ticket.tecnico}`);

    // 4. Finalizar ticket con materiales (esto activa el webhook)
    console.log('\n4️⃣ Finalizando ticket y enviando consumo al inventario...');
    const materialesConsumidos = [
      { nombre: 'Cable UTP', cantidad: 15 },
      { nombre: 'Conector RJ45', cantidad: 30 }
    ];

    const finalizarRes = await axios.post(
      `${TICKETS_API}/tickets/${ticket.id}/finalizar-con-materiales`,
      { materiales: materialesConsumidos }
    );
    
    console.log(`   ✅ ${finalizarRes.data.message}`);
    
    // 5. Verificar inventario actualizado
    console.log('\n5️⃣ Verificando inventario después del consumo...');
    const inventarioFinal = await axios.get(`${INVENTARIO_API}/inventario/materiales`);
    console.log('   Stock actualizado:');
    inventarioFinal.data.forEach(m => {
      console.log(`     - ${m.nombre}: ${m.stock} ${m.unidad}`);
    });

    // 6. Ver historial de movimientos
    console.log('\n6️⃣ Consultando historial de movimientos...');
    const historial = await axios.get(`${INVENTARIO_API}/movimientos`);
    const ultimosMovimientos = historial.data.slice(-2);
    console.log('   Últimos movimientos:');
    ultimosMovimientos.forEach(m => {
      console.log(`     - ${m.tipo}: ${m.cantidad} - ${m.motivo}`);
    });

    console.log('\n✅ PRUEBA COMPLETADA CON ÉXITO\n');

  } catch (error) {
    console.error('\n❌ ERROR EN PRUEBA:', error.response?.data || error.message);
  }
}

// Ejecutar prueba
probarIntegracionCompleta();