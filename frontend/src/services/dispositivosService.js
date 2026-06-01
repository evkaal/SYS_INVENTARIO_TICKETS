import { api } from './api';

export const dispositivosService = {
  getDispositivos: async () => {
    const response = await api.get('/dispositivos');
    return response.data;
  },

  getDispositivoById: async (id) => {
    const response = await api.get(`/dispositivos/${id}`);
    return response.data;
  },

  createDispositivo: async (dispositivo) => {
    const response = await api.post('/dispositivos', dispositivo);
    return response.data;
  },

  updateDispositivo: async (id, dispositivo) => {
    const response = await api.put(`/dispositivos/${id}`, dispositivo);
    return response.data;
  },

  updateEstado: async (id, estadoData) => {
    const response = await api.patch(`/dispositivos/${id}/estado`, estadoData);
    return response.data;
  },

  deleteDispositivo: async (id) => {
    const response = await api.delete(`/dispositivos/${id}`);
    return response.data;
  },
};