import React, { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { prestamosService } from '../../services/prestamosService';
import { useNotification } from '../../context/NotificationContext';

const initialFormData = {
  tipoMaterial: '',
  materialId: '',
  materialNombre: '',
  marca: '',
  autorizo: '',
  lugar: '',
  estadoMaterial: 'Buen estado',
  observacionesSalida: '',
  tecnico: ''
};

const PrestamoForm = ({ onSuccess, onClose }) => {
  const { showNotification } = useNotification();
  const [materiales, setMateriales] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  const cargarDatos = async () => {
    try {
      const [materialesData, tecnicosData] = await Promise.all([
        prestamosService.getMaterialesDisponibles(),
        prestamosService.getTecnicos()
      ]);
      setMateriales(materialesData);
      setTecnicos(tecnicosData);
    } catch (error) {
      console.error(error);
      showNotification('Error al cargar materiales disponibles', 'error');
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === 'materialId') {
      const material = materiales.find(item => item.id === value);
      if (material) {
        setFormData(prev => ({
          ...prev,
          materialId: value,
          tipoMaterial: material.tipo,
          materialNombre: material.nombre,
          marca: material.marca || ''
        }));
        return;
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.materialId) {
      showNotification('Seleccione un material', 'error');
      return;
    }

    if (!formData.autorizo.trim()) {
      showNotification('Ingrese quién autoriza', 'error');
      return;
    }

    if (!formData.lugar.trim()) {
      showNotification('Ingrese el lugar o área', 'error');
      return;
    }

    setLoading(true);

    try {
      await prestamosService.registrarPrestamo({
        ...formData,
        responsable: formData.autorizo,
        utilizadoEn: '',
        vale: ''
      });

      showNotification('Préstamo registrado exitosamente', 'success');
      setFormData(initialFormData);

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      showNotification(error.response?.data?.error || 'Error al registrar préstamo', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
          <h2 className="text-base font-semibold text-gray-900">Nuevo Préstamo</h2>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Material a prestar <span className="text-red-500">*</span>
            </label>
            <select
              name="materialId"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={formData.materialId}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar material</option>
              <optgroup label="Consumibles">
                {materiales.filter(item => item.tipo === 'consumible').map(item => (
                  <option key={item.id} value={item.id}>{item.displayName}</option>
                ))}
              </optgroup>
              <optgroup label="Dispositivos en funcionamiento">
                {materiales.filter(item => item.tipo === 'dispositivo').map(item => (
                  <option key={item.id} value={item.id}>{item.displayName}</option>
                ))}
              </optgroup>
            </select>
            {formData.materialNombre && (
              <p className="text-xs text-green-600 mt-1">
                Material seleccionado: {formData.materialNombre} {formData.marca && `(${formData.marca})`}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Autoriza <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="autorizo"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={formData.autorizo}
                onChange={handleChange}
                required
                placeholder="Nombre de quien autoriza"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Técnico</label>
              <select
                name="tecnico"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={formData.tecnico}
                onChange={handleChange}
              >
                <option value="">Seleccionar técnico</option>
                {tecnicos.map(tecnico => (
                  <option key={tecnico} value={tecnico}>{tecnico}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lugar o área <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lugar"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={formData.lugar}
              onChange={handleChange}
              required
              placeholder="Ej: laboratorio, aula, oficina, almacén"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado del material</label>
            <select
              name="estadoMaterial"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={formData.estadoMaterial}
              onChange={handleChange}
            >
              <option value="Buen estado">Buen estado</option>
              <option value="Regular estado">Regular estado</option>
              <option value="Requiere mantenimiento">Requiere mantenimiento</option>
              <option value="Como nuevo">Como nuevo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones de salida</label>
            <textarea
              name="observacionesSalida"
              rows="3"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
              value={formData.observacionesSalida}
              onChange={handleChange}
              placeholder="Notas sobre el estado del material al momento del préstamo"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 text-sm rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 font-medium"
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Registrar Préstamo'}
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

export default PrestamoForm;
