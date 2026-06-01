import { api } from './api';

export const prestamosService = {
  // Obtener préstamos activos
  getPrestamosActivos: async () => {
    const response = await api.get('/prestamos/activos');
    return response.data;
  },

  // Obtener historial de préstamos
  getHistorialPrestamos: async () => {
    const response = await api.get('/prestamos/historial');
    return response.data;
  },

  // Registrar nuevo préstamo
  registrarPrestamo: async (prestamo) => {
    const response = await api.post('/prestamos', prestamo);
    return response.data;
  },

  // Registrar devolución
  registrarDevolucion: async (id, observacionesEntrada) => {
    const response = await api.put(`/prestamos/${id}/devolucion`, { observacionesEntrada });
    return response.data;
  },

  // Obtener materiales disponibles
  getMaterialesDisponibles: async () => {
    const response = await api.get('/prestamos/materiales-disponibles');
    return response.data;
  },

  // Obtener técnicos
  getTecnicos: async () => {
    const response = await api.get('/prestamos/tecnicos');
    return response.data;
  },
};