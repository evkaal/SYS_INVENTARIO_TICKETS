import { api } from './api';

export const movimientosService = {
  registrarMovimiento: async (movimiento) => {
    const response = await api.post('/movimientos', movimiento);
    return response.data;
  },

  getMovimientos: async () => {
    const response = await api.get('/movimientos');
    return response.data;
  },

  getMovimientosByTipo: async (tipo) => {
    const response = await api.get(`/movimientos/tipo/${tipo}`);
    return response.data;
  },
};