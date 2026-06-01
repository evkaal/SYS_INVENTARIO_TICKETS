import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { ticketsService } from '../../services/ticketsService';
import { useNotification } from '../../context/NotificationContext';

const TicketForm = ({ onSuccess }) => {
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    tecnico: '',
    descripcion: '',
    estado: 'abierto'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.tecnico.trim()) {
      showNotification('El nombre del técnico es requerido', 'error');
      return;
    }
    
    if (!formData.descripcion.trim()) {
      showNotification('La descripción es requerida', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      await ticketsService.createTicket(formData);
      showNotification('Ticket creado exitosamente', 'success');
      setFormData({ tecnico: '', descripcion: '', estado: 'abierto' });
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Error:', err);
      showNotification('Error al crear ticket. Verifica que el servidor de tickets esté corriendo.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2 bg-gradient-to-r from-green-50 to-white">
        <PlusIcon className="w-4 h-4 text-green-600" />
        <h3 className="text-sm font-semibold text-gray-900">Nuevo Ticket</h3>
      </div>
      <form onSubmit={handleSubmit} className="p-4 space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Técnico <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="tecnico"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            value={formData.tecnico}
            onChange={handleChange}
            required
            placeholder="Nombre del técnico"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Descripción <span className="text-red-500">*</span>
          </label>
          <textarea
            name="descripcion"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
            rows="3"
            value={formData.descripcion}
            onChange={handleChange}
            required
            placeholder="Describa el mantenimiento realizado..."
          />
        </div>
        
        <button 
          type="submit" 
          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 text-sm rounded-lg hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 font-medium" 
          disabled={loading}
        >
          {loading ? 'Creando...' : 'Crear Ticket'}
        </button>
      </form>
    </div>
  );
};

export default TicketForm;