import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';
const TICKETS_API_URL = 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ticketsApi = axios.create({
  baseURL: TICKETS_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const handleApiError = (error, source = 'API') => {
  const backendMessage =
    error.response?.data?.error ||
    error.response?.data?.message ||
    error.message ||
    'Error desconocido';

  console.error(`Error en ${source}:`, {
    status: error.response?.status,
    message: backendMessage,
    data: error.response?.data,
  });

  return Promise.reject(error);
};

api.interceptors.response.use(
  (response) => response,
  (error) => handleApiError(error, 'API')
);

ticketsApi.interceptors.response.use(
  (response) => response,
  (error) => handleApiError(error, 'Tickets API')
);