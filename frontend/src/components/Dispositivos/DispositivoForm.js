import React, { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { dispositivosService } from '../../services/dispositivosService';
import { useNotification } from '../../context/NotificationContext';
import CatalogSelect from '../UI/CatalogSelect';

const tiposIniciales = [
  'Computadora', 'Laptop', 'Monitor', 'Impresora', 'Router', 'Switch', 'Proyector',
  'Bullet', 'Grabador de video en red', 'Webcam', 'Audífonos', 'HDMI Switch 5x1',
  'Bocinas', 'Servidor', 'Regulador de voltaje', 'Cartucho de tóner', 'Teléfono',
  'Tablet', 'Scanner', 'Pizarra interactiva', 'Access Point', 'Firewall', 'NAS',
  'UPS', 'Teclado', 'Mouse', 'Cámara', 'Otro'
];

const initialFormData = {
  numeroDeInventario: '',
  tipo: '',
  modelo: '',
  marca: '',
  numeroSerie: '',
  estadoActual: 'Disponible',
  condicion: 'En funcionamiento',
  factura: '',
  ubicacionActual: '',
  observaciones: ''
};

const DispositivoForm = ({ onSuccess, editingDispositivo, setEditingDispositivo, onClose }) => {
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingDispositivo) {
      setFormData({
        numeroDeInventario: editingDispositivo.numeroDeInventario || '',
        tipo: editingDispositivo.tipo || '',
        modelo: editingDispositivo.modelo || '',
        marca: editingDispositivo.marca || '',
        numeroSerie: editingDispositivo.numeroSerie || '',
        estadoActual: editingDispositivo.estadoActual || 'Disponible',
        condicion: editingDispositivo.condicion || 'En funcionamiento',
        factura: editingDispositivo.factura || '',
        ubicacionActual: editingDispositivo.ubicacionActual || editingDispositivo.departamento || '',
        observaciones: editingDispositivo.observaciones || ''
      });
    } else {
      setFormData(initialFormData);
    }
  }, [editingDispositivo]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const setField = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.numeroDeInventario.trim()) {
      showNotification('El número de inventario es requerido', 'error');
      return;
    }

    if (!formData.tipo.trim()) {
      showNotification('Debe seleccionar un tipo', 'error');
      return;
    }

    if (!formData.modelo.trim()) {
      showNotification('El modelo es requerido', 'error');
      return;
    }

    if (!formData.marca.trim()) {
      showNotification('La marca es requerida', 'error');
      return;
    }

    if (!formData.numeroSerie.trim()) {
      showNotification('El número de serie es requerido', 'error');
      return;
    }

    setLoading(true);

    try {
      if (editingDispositivo) {
        await dispositivosService.updateDispositivo(editingDispositivo._id, formData);
        showNotification('Dispositivo actualizado correctamente', 'success');
      } else {
        await dispositivosService.createDispositivo(formData);
        showNotification('Dispositivo creado correctamente', 'success');
      }

      if (onSuccess) onSuccess();
      if (setEditingDispositivo) setEditingDispositivo(null);
      if (onClose) onClose();
    } catch (error) {
      showNotification(error.response?.data?.error || 'Error al guardar dispositivo', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
          <h2 className="text-base font-semibold text-gray-900">
            {editingDispositivo ? 'Editar Dispositivo' : 'Nuevo Dispositivo'}
          </h2>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No. Inventario <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="numeroDeInventario"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={formData.numeroDeInventario}
              onChange={handleChange}
              required
              placeholder="INV-001"
            />
          </div>

          <CatalogSelect
            label="Tipo"
            name="tipo"
            value={formData.tipo}
            onChange={(value) => setField('tipo', value)}
            storageKey="catalogoTiposDispositivos"
            defaultOptions={tiposIniciales}
            required
            placeholder="Seleccionar tipo"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modelo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="modelo"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={formData.modelo}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marca <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="marca"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={formData.marca}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No. Serie <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="numeroSerie"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={formData.numeroSerie}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Factura/Comprobante</label>
              <input
                type="text"
                name="factura"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={formData.factura}
                onChange={handleChange}
                placeholder="No. factura"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado de disponibilidad</label>
              <select
                name="estadoActual"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={formData.estadoActual}
                onChange={handleChange}
              >
                <option value="Disponible">Disponible</option>
                <option value="Prestado">Prestado</option>
                <option value="Baja">Baja</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condición</label>
              <select
                name="condicion"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={formData.condicion}
                onChange={handleChange}
              >
                <option value="En funcionamiento">En funcionamiento</option>
                <option value="No funciona">No funciona</option>
                <option value="En reparación">En reparación</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación actual</label>
            <input
              type="text"
              name="ubicacionActual"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={formData.ubicacionActual}
              onChange={handleChange}
              placeholder="Ej: laboratorio, almacén, oficina"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea
              name="observaciones"
              rows="3"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
              value={formData.observaciones}
              onChange={handleChange}
              placeholder="Notas adicionales sobre el dispositivo"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 text-sm rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 font-medium"
              disabled={loading}
            >
              {loading ? 'Procesando...' : (editingDispositivo ? 'Actualizar' : 'Crear')}
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

export default DispositivoForm;
