import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { prestamosService } from '../../services/prestamosService';
import { useNotification } from '../../context/NotificationContext';
import DepartamentoSelect from '../UI/DepartamentoSelect';

const PrestamoForm = ({ onSuccess, onClose }) => {
  const { showNotification } = useNotification();
  const [materiales, setMateriales] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tipoMaterial: '',
    materialId: '',
    materialNombre: '',
    marca: '',
    autorizo: '',
    lugar: '',
    estadoMaterial: 'Buen estado',
    observacionesSalida: '',
    tecnico: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [mat, tec] = await Promise.all([
        prestamosService.getMaterialesDisponibles(),
        prestamosService.getTecnicos()
      ]);
      setMateriales(mat);
      setTecnicos(tec);
    } catch (err) {
      console.error(err);
      showNotification('Error al cargar datos', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'materialId') {
      const material = materiales.find(m => m.id === value);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.materialId) {
      showNotification('Seleccione un material', 'error');
      return;
    }
    
    if (!formData.autorizo && !formData.tecnico) {
      showNotification('Ingrese quien autoriza o seleccione un técnico', 'error');
      return;
    }
    
    if (!formData.lugar) {
      showNotification('Ingrese el lugar/departamento', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      await prestamosService.registrarPrestamo({
        ...formData,
        tecnico: formData.tecnico,
        responsable: formData.autorizo,
        utilizadoEn: '',
        vale: '' // Campo vacío ya que se eliminó
      });
      
      showNotification('Préstamo registrado exitosamente', 'success');
      setFormData({
        tipoMaterial: '', materialId: '', materialNombre: '', marca: '',
        autorizo: '', lugar: '', estadoMaterial: 'Buen estado',
        observacionesSalida: '', tecnico: ''
      });
      
      if (onSuccess) onSuccess();
      if (onClose) onClose();
      
    } catch (err) {
      showNotification(err.response?.data?.error || 'Error al registrar préstamo', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
          <h2 className="text-base font-semibold text-gray-900">Nuevo Préstamo</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Material */}
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
                {materiales.filter(m => m.tipo === 'consumible').map(m => (
                  <option key={m.id} value={m.id}>
                    {m.displayName}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Dispositivos">
                {materiales.filter(m => m.tipo === 'dispositivo').map(m => (
                  <option key={m.id} value={m.id}>
                    {m.displayName}
                  </option>
                ))}
              </optgroup>
            </select>
            {formData.materialNombre && (
              <p className="text-xs text-green-600 mt-1">
                ✓ Material seleccionado: {formData.materialNombre} {formData.marca && `(${formData.marca})`}
              </p>
            )}
          </div>

          {/* Autorizo y Técnico en fila */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Autorizo <span className="text-red-500">*</span>
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
                {tecnicos.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Lugar/Departamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lugar/Departamento <span className="text-red-500">*</span>
            </label>
            <DepartamentoSelect
              value={formData.lugar}
              onChange={(value) => setFormData({ ...formData, lugar: value })}
              placeholder="Seleccionar departamento"
              required={true}
            />
          </div>

          {/* Estado del material */}
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

          {/* Observaciones de salida */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones de salida</label>
            <textarea
              name="observacionesSalida"
              rows="3"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
              value={formData.observacionesSalida}
              onChange={handleChange}
              placeholder="Notas sobre el estado del material al momento del préstamo..."
            />
          </div>

          {/* Botones */}
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