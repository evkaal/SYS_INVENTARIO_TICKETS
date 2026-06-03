import React, { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { consumiblesService } from '../../services/consumiblesService';
import { useNotification } from '../../context/NotificationContext';
import CatalogSelect from '../UI/CatalogSelect';

const categoriasIniciales = ['Cables', 'Conectores', 'Herramientas', 'Insumos', 'Limpieza', 'Papelería', 'Tóner', 'Redes'];
const unidadesIniciales = ['piezas', 'metros', 'cajas', 'resmas', 'paquetes', 'kilogramos', 'litros'];

const initialFormData = {
  nombre: '',
  categoria: '',
  stock: 0,
  unidad: 'piezas',
  descripcion: '',
  marca: '',
  ubicacionActual: '',
  stockMinimo: 0
};

const ConsumibleForm = ({ onSuccess, editingConsumible, setEditingConsumible, onClose }) => {
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingConsumible) {
      setFormData({
        nombre: editingConsumible.nombre || '',
        categoria: editingConsumible.categoria || '',
        stock: editingConsumible.stock ?? 0,
        unidad: editingConsumible.unidad || 'piezas',
        descripcion: editingConsumible.descripcion || '',
        marca: editingConsumible.marca || '',
        ubicacionActual: editingConsumible.ubicacionActual || '',
        stockMinimo: editingConsumible.stockMinimo || 0
      });
    } else {
      setFormData(initialFormData);
    }
  }, [editingConsumible]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const setField = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cantidad = Number(formData.stock);

    if (!formData.nombre.trim()) {
      showNotification('El nombre es requerido', 'error');
      return;
    }

    if (!formData.categoria.trim()) {
      showNotification('Debe seleccionar una categoría', 'error');
      return;
    }

    if (Number.isNaN(cantidad) || cantidad < 0) {
      showNotification('La cantidad debe ser mayor o igual a 0', 'error');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        stock: cantidad,
        cantidad
      };

      if (editingConsumible) {
        await consumiblesService.updateConsumible(editingConsumible._id, payload);
        showNotification('Consumible actualizado correctamente', 'success');
      } else {
        await consumiblesService.createConsumible(payload);
        showNotification('Consumible creado correctamente', 'success');
      }

      setFormData(initialFormData);
      if (onSuccess) onSuccess();
      if (setEditingConsumible) setEditingConsumible(null);
      if (onClose) onClose();
    } catch (error) {
      showNotification(error.response?.data?.error || 'Error al guardar consumible', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
          <h2 className="text-base font-semibold text-gray-900">
            {editingConsumible ? 'Editar Consumible' : 'Nuevo Consumible'}
          </h2>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
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
              placeholder="Ej: Cable UTP, hojas bond, tóner"
            />
          </div>

          <CatalogSelect
            label="Categoría"
            name="categoria"
            value={formData.categoria}
            onChange={(value) => setField('categoria', value)}
            storageKey="catalogoCategoriasConsumibles"
            defaultOptions={categoriasIniciales}
            required
            placeholder="Seleccionar categoría"
          />

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

<CatalogSelect
  label="Unidad"
  name="unidad"
  value={formData.unidad}
  onChange={(value) => setField('unidad', value)}
  storageKey="catalogoUnidadesConsumibles"
  defaultOptions={unidadesIniciales}
  required
  placeholder="Seleccionar unidad"
/>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad <span className="text-red-500">*</span>
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
            <p className="text-xs text-gray-500 mt-1">Se usa cantidad en lugar de stock mínimo.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
            <input
              type="text"
              name="ubicacionActual"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={formData.ubicacionActual}
              onChange={handleChange}
              placeholder="Ej: bodega, estante, armario"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              name="descripcion"
              rows="3"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Descripción adicional del consumible"
            />
          </div>

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
