import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon, MagnifyingGlassIcon, PlusIcon, ChevronDownIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { dispositivosService } from '../../services/dispositivosService';
import { useNotification } from '../../context/NotificationContext';
import DepartamentoSelect from '../UI/DepartamentoSelect';

// Lista de tipos predefinidos
const tiposPredefinidosIniciales = [
  'Computadora', 'Laptop', 'Monitor', 'Impresora', 'Router', 'Switch', 'Proyector',
  'Bullet', 'Grabador de video en red', 'Webcam', 'Audifonos', 'HDMI Switch 5x1',
  'Bocinas', 'Servidor', 'Regulador de voltaje', 'Cartucho de toner', 'Telefono',
  'Tablet', 'Scanner', 'Fax', 'Pizarra interactiva', 'Access Point', 'Firewall',
  'NAS', 'UPS', 'Teclado', 'Mouse', 'Parlante', 'Micrófono', 'Cámara', 'Otro'
];

const loadSavedTypes = () => {
  const saved = localStorage.getItem('dispositivoTipos');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return [...new Set([...tiposPredefinidosIniciales, ...parsed])];
    } catch (e) {
      return [...tiposPredefinidosIniciales];
    }
  }
  return [...tiposPredefinidosIniciales];
};

const saveTypes = (types) => {
  const customTypes = types.filter(t => !tiposPredefinidosIniciales.includes(t));
  localStorage.setItem('dispositivoTipos', JSON.stringify(customTypes));
};

const DispositivoForm = ({ onSuccess, editingDispositivo, setEditingDispositivo, onClose }) => {
  const { showNotification } = useNotification();
  const [tiposDisponibles, setTiposDisponibles] = useState(loadSavedTypes);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAddingNewType, setIsAddingNewType] = useState(false);
  const [newType, setNewType] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const [filteredTipos, setFilteredTipos] = useState(tiposDisponibles);
  const [formData, setFormData] = useState({
    numeroDeInventario: '',
    tipo: '',
    modelo: '',
    marca: '',
    numeroSerie: '',
    estadoActual: 'Disponible',
    factura: '',
    departamento: '',
    observaciones: ''
  });
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
        factura: editingDispositivo.factura || '',
        departamento: editingDispositivo.departamento || '',
        observaciones: editingDispositivo.observaciones || ''
      });
    }
  }, [editingDispositivo]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = tiposDisponibles.filter(tipo =>
        tipo.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTipos(filtered);
    } else {
      setFilteredTipos(tiposDisponibles);
    }
  }, [searchTerm, tiposDisponibles]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowDropdown(false);
        setIsAddingNewType(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTipoSelect = (tipo) => {
    setFormData({ ...formData, tipo });
    setSearchTerm('');
    setShowDropdown(false);
  };

  const tipoExiste = (tipo) => {
    return tiposDisponibles.some(t => t.toLowerCase() === tipo.toLowerCase());
  };

  const handleAddNewType = () => {
    const trimmedType = newType.trim();
    
    if (!trimmedType) {
      showNotification('Ingrese un nombre para el tipo', 'error');
      return;
    }
    
    if (tipoExiste(trimmedType)) {
      showNotification(`El tipo "${trimmedType}" ya existe`, 'error');
      return;
    }
    
    const updatedTipos = [...tiposDisponibles, trimmedType];
    setTiposDisponibles(updatedTipos);
    saveTypes(updatedTipos);
    setFormData({ ...formData, tipo: trimmedType });
    setNewType('');
    setIsAddingNewType(false);
    setShowDropdown(false);
    setSearchTerm('');
    showNotification(`Tipo "${trimmedType}" agregado`, 'success');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.numeroDeInventario.trim()) {
      showNotification('El número de inventario es requerido', 'error');
      return;
    }
    
    if (!formData.tipo) {
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
            {editingDispositivo ? 'Editar Dispositivo' : 'Nuevo Dispositivo'}
          </h2>
          <button 
            onClick={onClose} 
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* No. Inventario */}
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
          
          {/* Tipo con buscador */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="relative" ref={inputRef}>
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer"
                  placeholder="Buscar o seleccionar tipo..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                    setIsAddingNewType(false);
                  }}
                  onFocus={() => setShowDropdown(true)}
                />
                <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              
              {showDropdown && (
                <div ref={dropdownRef} className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredTipos.length > 0 ? (
                    filteredTipos.map((tipo, index) => (
                      <button
                        key={index}
                        type="button"
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                        onClick={() => handleTipoSelect(tipo)}
                      >
                        {tipo}
                      </button>
                    ))
                  ) : (
                    <div className="p-3">
                      <p className="text-sm text-gray-500">No se encontraron resultados</p>
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 px-3 py-2 mt-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        onClick={() => {
                          setIsAddingNewType(true);
                          setNewType(searchTerm);
                          setShowDropdown(false);
                        }}
                      >
                        <PlusIcon className="w-4 h-4" />
                        Agregar "{searchTerm}" como nuevo tipo
                      </button>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-100">
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                      onClick={() => {
                        setIsAddingNewType(true);
                        setNewType('');
                        setShowDropdown(false);
                      }}
                    >
                      <PlusIcon className="w-4 h-4" />
                      Agregar nuevo tipo
                    </button>
                  </div>
                </div>
              )}
            </div>
            {formData.tipo && (
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <CheckCircleIcon className="w-3.5 h-3.5" />
                Tipo seleccionado: {formData.tipo}
              </p>
            )}
          </div>
          
          {/* Modelo y Marca */}
          <div className="grid grid-cols-2 gap-3">
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
          
          {/* No. Serie y Estado */}
          <div className="grid grid-cols-2 gap-3">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado <span className="text-red-500">*</span>
              </label>
              <select
                name="estadoActual"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={formData.estadoActual}
                onChange={handleChange}
              >
                <option value="Disponible">Disponible</option>
                <option value="Ocupado">Ocupado</option>
                <option value="Prestado">Prestado</option>
                <option value="No encontrado">No encontrado</option>
              </select>
            </div>
          </div>
          
          {/* Factura y Departamento */}
          <div className="grid grid-cols-2 gap-3">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
              <DepartamentoSelect
                value={formData.departamento}
                onChange={(value) => setFormData({ ...formData, departamento: value })}
                placeholder="Seleccionar departamento"
              />
            </div>
          </div>
          
          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea
              name="observaciones"
              rows="3"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
              value={formData.observaciones}
              onChange={handleChange}
              placeholder="Notas adicionales sobre el dispositivo..."
            />
          </div>
          
          {/* Botones */}
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

      {/* Modal para agregar nuevo tipo */}
      {isAddingNewType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="flex justify-between items-center px-4 py-3 border-b">
              <h3 className="text-sm font-semibold text-gray-900">Agregar nuevo tipo</h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddingNewType(false);
                  setNewType('');
                }}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del tipo</label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                placeholder="Ej: Escáner, Tablet"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddNewType();
                  }
                }}
              />
              {newType && tipoExiste(newType) && (
                <p className="text-xs text-red-500 mt-1">⚠️ El tipo ya existe</p>
              )}
            </div>
            <div className="flex gap-3 px-4 py-3 bg-gray-50 rounded-b-xl">
              <button
                type="button"
                onClick={handleAddNewType}
                disabled={!newType.trim() || tipoExiste(newType)}
                className="flex-1 bg-blue-600 text-white px-3 py-2 text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Agregar
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingNewType(false);
                  setNewType('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 text-sm rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DispositivoForm;