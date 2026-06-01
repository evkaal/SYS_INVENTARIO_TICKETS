// 1. Seleccionar la base de datos de tu .env
use('inventario_tickets');

// 2. Insertar un Dispositivo de prueba (según tu archivo Dispositivo.js)
db.dispositivos.insertOne({
  nombre: "Computadora de Escritorio Dell",
  tipo: "Equipo de Cómputo",
  estado: "Operativo",
  fechaRegistro: new Date()
});

// 3. Insertar un Consumible de prueba (según tu archivo Consumible.js)
db.consumibles.insertOne({
  nombre: "Cable de Red UTP Cat6",
  stock: 60,
  unidad: "metros"
});