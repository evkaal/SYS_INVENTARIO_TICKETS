import { api } from './api';

export const consumiblesService = {
  getConsumibles: async () => {
    const response = await api.get('/consumibles');
    return response.data;
  },

  getConsumibleById: async (id) => {
    const response = await api.get(`/consumibles/${id}`);
    return response.data;
  },

  createConsumible: async (consumible) => {
    const response = await api.post('/consumibles', consumible);
    return response.data;
  },

  updateConsumible: async (id, consumible) => {
    const response = await api.put(`/consumibles/${id}`, consumible);
    return response.data;
  },

  deleteConsumible: async (id) => {
    const response = await api.delete(`/consumibles/${id}`);
    return response.data;
  },
};