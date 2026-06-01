import { ticketsApi } from './api';

export const ticketsService = {
  getTickets: async () => {
    const response = await ticketsApi.get('/tickets');
    return response.data;
  },

  getTicketById: async (id) => {
    const response = await ticketsApi.get(`/tickets/${id}`);
    return response.data;
  },

  createTicket: async (ticket) => {
    const response = await ticketsApi.post('/tickets', ticket);
    return response.data;
  },

  finalizarTicket: async (ticketId, materiales) => {
    const response = await ticketsApi.post(`/tickets/${ticketId}/finalizar`, { materiales });
    return response.data;
  },

  validarMateriales: async (ticketId, materiales) => {
    const response = await ticketsApi.post(`/tickets/${ticketId}/validar`, { materiales });
    return response.data;
  },
};