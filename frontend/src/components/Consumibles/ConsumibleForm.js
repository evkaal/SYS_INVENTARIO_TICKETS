import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { consumiblesService } from '../../services/consumiblesService';
import { useNotification } from '../../context/NotificationContext';
import DepartamentoSelect from '../UI/DepartamentoSelect';

const ConsumibleForm = ({ onSuccess, editingConsumible, setEditingConsumible, onClose }) => {
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    stock: 0,
    unidad: 'piezas',
    descripcion: '',
    marca: '',
    ubicacionActual: '',
    stockMinimo: 10
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingConsumible) {
      setFormData({
        nombre: editingConsumible.nombre || '',
        categoria: editingConsumible.categoria || '',
        stock: editingConsumible.stock || 0,
        unidad: editingConsumible.unidad || 'piezas',
        descripcion: editingConsumible.descripcion || '',
        marca: editingConsumible.marca || '',
        ubicacionActual: editingConsumible.ubicacionActual || '',
        stockMinimo: editingConsumible.stockMinimo || 10
      });
    }
  }, [editingConsumible]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      showNotification('El nombre es requerido', 'error');
      return;
    }
    
    if (!formData.categoria) {
      showNotification('Debe seleccionar una categoría', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      if (editingConsumible) {
        await consumiblesService.updateConsumible(editingConsumible._id, formData);
        showNotification('Consumible actualizado correctamente', 'success');
      } else {
        await consumiblesService.createConsumible(formData);
        showNotification('Consumible creado correctamente', 'success');
      }
      
      setFormData({
        nombre: '', categoria: '', stock: 0, unidad: 'piezas',
        descripcion: '', marca: '', ubicacionActual: '', stockMinimo: 10
      });
      
      if (onSuccess) onSuccess();
      if (setEditingConsumible) setEditingConsumible(null);
      if (onClose) onClose();
      
    } catch (err) {
      showNotification(err.response?.data?.error || 'Error al procesar', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
          <h2 className="text-base font-semibold text-gray-900">
            {editingConsumible ? 'Editar Consumible' : 'Nuevo Consumible'}
          </h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nombre"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={formData.nombre}
              onChange={handleChange}
              required
              placeholder="Ej: Cable UTP, Hojas bond, Tóner"
            />
          </div>
          
          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría <span className="text-red-500">*</span>
            </label>
            <select
              name="categoria"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={formData.categoria}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar categoría</option>
              <option value="Cables">Cables</option>
              <option value="Conectores">Conectores</option>
              <option value="Herramientas">Herramientas</option>
              <option value="Insumos">Insumos</option>
              <option value="Limpieza">Limpieza</option>
              <option value="Papelería">Papelería</option>
            </select>
          </div>
          
          {/* Marca y Unidad */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
              <input
                type="text"
                name="marca"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={formData.marca}
                onChange={handleChange}
                placeholder="Ej: HP, Epson, 3M"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unidad <span className="text-red-500">*</span>
              </label>
              <select
                name="unidad"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={formData.unidad}
                onChange={handleChange}
              >
                <option value="piezas">Piezas</option>
                <option value="metros">Metros</option>
                <option value="cajas">Cajas</option>
                <option value="resmas">Resmas</option>
                <option value="paquetes">Paquetes</option>
                <option value="kilogramos">Kilogramos</option>
                <option value="litros">Litros</option>
              </select>
            </div>
          </div>
          
          {/* Stock y Stock Mínimo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stock"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock mínimo</label>
              <input
                type="number"
                name="stockMinimo"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={formData.stockMinimo}
                onChange={handleChange}
                min="0"
                placeholder="Alerta cuando baje de aquí"
              />
            </div>
          </div>
          
          {/* Ubicación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
            <input
              type="text"
              name="ubicacionActual"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={formData.ubicacionActual}
              onChange={handleChange}
              placeholder="Estante, bodega, armario"
            />
          </div>
          
          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              name="descripcion"
              rows="3"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Descripción adicional del consumible..."
            />
          </div>
          
          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 text-sm rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 font-medium" 
              disabled={loading}
            >
              {loading ? 'Procesando...' : (editingConsumible ? 'Actualizar' : 'Crear')}
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

export default ConsumibleForm;