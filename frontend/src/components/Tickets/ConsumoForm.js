import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { ticketsService } from '../../services/ticketsService';
import { consumiblesService } from '../../services/consumiblesService';
import { useNotification } from '../../context/NotificationContext';

const ConsumoForm = ({ ticket, onClose, onSuccess }) => {
  const { showNotification } = useNotification();
  const [materiales, setMateriales] = useState([]);
  const [materialesDisponibles, setMaterialesDisponibles] = useState([]);
  const [materialSeleccionado, setMaterialSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarMaterialesDisponibles();
  }, []);

  const cargarMaterialesDisponibles = async () => {
    try {
      const data = await consumiblesService.getConsumibles();
      // Solo mostrar materiales con stock > 0
      const disponibles = data.filter(m => m.stock > 0);
      setMaterialesDisponibles(disponibles);
      
      if (disponibles.length === 0) {
        showNotification('No hay materiales disponibles con stock', 'info');
      }
    } catch (err) {
      console.error(err);
      showNotification('Error al cargar materiales', 'error');
    }
  };

  const agregarMaterial = () => {
    const material = materialesDisponibles.find(m => m._id === materialSeleccionado);
    if (!material) {
      showNotification('Seleccione un material válido', 'error');
      return;
    }
    
    if (cantidad < 1) {
      showNotification('La cantidad debe ser mayor a 0', 'error');
      return;
    }
    
    if (cantidad > material.stock) {
      showNotification(`Stock insuficiente. Solo hay ${material.stock} ${material.unidad} disponibles`, 'error');
      return;
    }
    
    // Verificar si ya se agregó
    const existente = materiales.find(m => m.materialId === material._id);
    if (existente) {
      showNotification(`"${material.nombre}" ya fue agregado`, 'warning');
      return;
    }
    
    setMateriales([...materiales, {
      nombre: material.nombre,
      cantidad: cantidad,
      materialId: material._id,
      stockDisponible: material.stock,
      unidad: material.unidad,
      marca: material.marca || ''
    }]);
    
    setMaterialSeleccionado('');
    setCantidad(1);
    showNotification(`"${material.nombre}" agregado`, 'success');
  };

  const eliminarMaterial = (index) => {
    const material = materiales[index];
    setMateriales(materiales.filter((_, i) => i !== index));
    showNotification(`"${material.nombre}" eliminado`, 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (materiales.length === 0) {
      showNotification('Debe agregar al menos un material', 'error');
      return;
    }

    setLoading(true);
    
    try {
      // Preparar datos para el webhook
      const consumoData = materiales.map(m => ({
        nombre: m.nombre,
        cantidad: m.cantidad
      }));
      
      console.log('Enviando consumo:', {
        ticket_id: ticket.id,
        tecnico: ticket.tecnico,
        materiales: consumoData
      });
      
      const response = await ticketsService.finalizarTicket(ticket.id, consumoData);
      console.log('Respuesta:', response);
      
      showNotification(`Consumo registrado exitosamente para ticket ${ticket.id}`, 'success');
      
      // Limpiar y cerrar
      setMateriales([]);
      onSuccess();
    } catch (err) {
      console.error('Error detallado:', err);
      const errorMsg = err.response?.data?.error || err.response?.data?.detalle || 'Error al registrar consumo';
      showNotification(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white flex justify-between items-center px-5 py-3 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Registrar Consumo - {ticket.id}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Información del ticket */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-gray-700">Técnico: {ticket.tecnico}</p>
            <p className="text-sm text-gray-600 mt-1">{ticket.descripcion}</p>
          </div>
          
          {/* Selección de material */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Agregar material</label>
            <div className="flex gap-2">
              <select
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={materialSeleccionado}
                onChange={(e) => setMaterialSeleccionado(e.target.value)}
              >
                <option value="">-- Seleccionar material --</option>
                {materialesDisponibles.map(m => (
                  <option key={m._id} value={m._id}>
                    {m.nombre} - Stock: {m.stock} {m.unidad} {m.marca ? `(${m.marca})` : ''}
                  </option>
                ))}
              </select>
              <input
                type="number"
                className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
                min="1"
                placeholder="Cant"
              />
              <button
                type="button"
                onClick={agregarMaterial}
                className="bg-blue-600 text-white px-3 py-2 text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lista de materiales agregados */}
          {materiales.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Materiales a consumir:</label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50">
                {materiales.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white p-2 rounded-lg shadow-sm">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{m.nombre}</p>
                      <p className="text-xs text-gray-500">
                        Stock disponible: {m.stockDisponible} {m.unidad}
                        {m.marca && ` | Marca: ${m.marca}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-900">{m.cantidad}</span>
                      <button
                        type="button"
                        onClick={() => eliminarMaterial(idx)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button 
              type="submit" 
              className="flex-1 bg-green-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 font-medium" 
              disabled={loading || materiales.length === 0}
            >
              {loading ? 'Registrando...' : 'Registrar Consumo'}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 text-sm rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConsumoForm;