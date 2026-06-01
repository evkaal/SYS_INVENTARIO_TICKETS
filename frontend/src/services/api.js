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

api.interceptors.response.use(
  response => response,
  error => {
    console.error('Error en API:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

ticketsApi.interceptors.response.use(
  response => response,
  error => {
    console.error('Error en Tickets API:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);