import React, { useState, useEffect } from 'react';
import { XMarkIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import { movimientosService } from '../../services/movimientosService';
import { consumiblesService } from '../../services/consumiblesService';
import { dispositivosService } from '../../services/dispositivosService';
import { useNotification } from '../../context/NotificationContext';
import DepartamentoSelect from '../UI/DepartamentoSelect';

const MovimientoForm = ({ onSuccess, dispositivoPrecargado, consumiblePrecargado, onClose }) => {
  const { showNotification } = useNotification();
  const [tipoMovimiento, setTipoMovimiento] = useState('consumible');
  const [consumibles, setConsumibles] = useState([]);
  const [dispositivos, setDispositivos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    materialId: '',
    dispositivoId: '',
    materialNombre: '',
    marca: '',
    tipo: 'Entrada',
    cantidad: 1,
    departamento: '',
    motivo: '',
    vale: '',
    ticketId: '',
    tecnico: ''
  });

  useEffect(() => {
    cargarDatos();
    
    if (dispositivoPrecargado) {
      setTipoMovimiento('dispositivo');
      setFormData(prev => ({
        ...prev,
        dispositivoId: dispositivoPrecargado._id,
        materialNombre: `${dispositivoPrecargado.tipo} - ${dispositivoPrecargado.modelo} (${dispositivoPrecargado.numeroDeInventario})`,
        marca: dispositivoPrecargado.marca,
        departamento: dispositivoPrecargado.departamento || ''
      }));
    }
    
    if (consumiblePrecargado) {
      setTipoMovimiento('consumible');
      setFormData(prev => ({
        ...prev,
        materialId: consumiblePrecargado._id,
        materialNombre: consumiblePrecargado.nombre,
        marca: consumiblePrecargado.marca || '',
        cantidad: 1
      }));
    }
  }, [dispositivoPrecargado, consumiblePrecargado]);

  const cargarDatos = async () => {
    try {
      const [cons, disp] = await Promise.all([
        consumiblesService.getConsumibles(),
        dispositivosService.getDispositivos()
      ]);
      setConsumibles(cons);
      setDispositivos(disp);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'materialId' && tipoMovimiento === 'consumible') {
      const consumible = consumibles.find(c => c._id === value);
      if (consumible) {
        setFormData(prev => ({
          ...prev,
          materialId: value,
          materialNombre: consumible.nombre,
          marca: consumible.marca || ''
        }));
        return;
      }
    }
    
    if (name === 'dispositivoId' && tipoMovimiento === 'dispositivo') {
      const dispositivo = dispositivos.find(d => d._id === value);
      if (dispositivo) {
        setFormData(prev => ({
          ...prev,
          dispositivoId: value,
          materialNombre: `${dispositivo.tipo} - ${dispositivo.modelo} (${dispositivo.numeroDeInventario})`,
          marca: dispositivo.marca,
          departamento: dispositivo.departamento || ''
        }));
        return;
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (tipoMovimiento === 'consumible' && !formData.materialId) {
      showNotification('Seleccione un consumible', 'error');
      return;
    }
    
    if (tipoMovimiento === 'dispositivo' && !formData.dispositivoId) {
      showNotification('Seleccione un dispositivo', 'error');
      return;
    }
    
    if (!formData.motivo.trim()) {
      showNotification('Ingrese un motivo', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      const movimientoData = {
        ...formData,
        cantidad: tipoMovimiento === 'consumible' ? formData.cantidad : 1
      };
      
      await movimientosService.registrarMovimiento(movimientoData);
      showNotification('Movimiento registrado correctamente', 'success');
      
      setFormData({
        materialId: '', dispositivoId: '', materialNombre: '', marca: '',
        tipo: 'Entrada', cantidad: 1, departamento: '', motivo: '', vale: '', ticketId: '', tecnico: ''
      });
      
      if (onSuccess) onSuccess();
      if (onClose) onClose();
      
    } catch (err) {
      showNotification(err.response?.data?.error || 'Error al registrar', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      materialId: '', dispositivoId: '', materialNombre: '', marca: '',
      tipo: 'Entrada', cantidad: 1, departamento: '', motivo: '', vale: '', ticketId: '', tecnico: ''
    });
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
          <div className="flex items-center gap-2">
            <ArrowsRightLeftIcon className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-semibold text-gray-900">Registrar Movimiento</h2>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Tipo de movimiento - Radios */}
          {!dispositivoPrecargado && !consumiblePrecargado && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de movimiento</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tipoMovimiento"
                    value="consumible"
                    checked={tipoMovimiento === 'consumible'}
                    onChange={() => {
                      setTipoMovimiento('consumible');
                      setFormData(prev => ({ ...prev, materialId: '', dispositivoId: '', materialNombre: '', marca: '' }));
                    }}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Consumible</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tipoMovimiento"
                    value="dispositivo"
                    checked={tipoMovimiento === 'dispositivo'}
                    onChange={() => {
                      setTipoMovimiento('dispositivo');
                      setFormData(prev => ({ ...prev, materialId: '', dispositivoId: '', materialNombre: '', marca: '' }));
                    }}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Dispositivo</span>
                </label>
              </div>
            </div>
          )}

          {/* Selección de material según tipo */}
          {tipoMovimiento === 'consumible' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Consumible <span className="text-red-500">*</span>
              </label>
              <select
                name="materialId"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={formData.materialId}
                onChange={handleChange}
                required
                disabled={!!consumiblePrecargado}
              >
                <option value="">Seleccionar consumible</option>
                {consumibles.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.nombre} - {c.marca || 'Sin marca'} (Stock: {c.stock} {c.unidad})
                  </option>
                ))}
              </select>
            </div>
          )}

          {tipoMovimiento === 'dispositivo' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dispositivo <span className="text-red-500">*</span>
              </label>
              <select
                name="dispositivoId"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={formData.dispositivoId}
                onChange={handleChange}
                required
                disabled={!!dispositivoPrecargado}
              >
                <option value="">Seleccionar dispositivo</option>
                {dispositivos.map(d => (
                  <option key={d._id} value={d._id}>
                    {d.numeroDeInventario} - {d.tipo} {d.modelo} ({d.marca}) - {d.estadoActual}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Mostrar información del material seleccionado */}
          {formData.materialNombre && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <p className="text-xs font-medium text-blue-600 mb-1">Material seleccionado:</p>
              <p className="text-sm font-medium text-gray-800">{formData.materialNombre}</p>
              {formData.marca && (
                <p className="text-xs text-gray-500 mt-1">Marca: {formData.marca}</p>
              )}
            </div>
          )}

          {/* Operación y Cantidad */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operación <span className="text-red-500">*</span>
              </label>
              <select
                name="tipo"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={formData.tipo}
                onChange={handleChange}
              >
                <option value="Entrada">Entrada (+)</option>
                <option value="Salida">Salida (-)</option>
                <option value="Prestado">Préstamo</option>
              </select>
            </div>
            
            {tipoMovimiento === 'consumible' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                <input
                  type="number"
                  name="cantidad"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  value={formData.cantidad}
                  onChange={handleChange}
                  min="1"
                />
              </div>
            )}
          </div>

          {/* Departamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
            <DepartamentoSelect
              value={formData.departamento}
              onChange={(value) => setFormData({ ...formData, departamento: value })}
              placeholder="Seleccionar departamento"
            />
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo <span className="text-red-500">*</span>
            </label>
            <textarea
              name="motivo"
              rows="3"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
              value={formData.motivo}
              onChange={handleChange}
              required
              placeholder="Ej: Compra de insumos, Mantenimiento preventivo, Préstamo a departamento..."
            />
          </div>

          {/* Vale y Ticket */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vale / Comprobante</label>
              <input
                type="text"
                name="vale"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={formData.vale}
                onChange={handleChange}
                placeholder="No. de vale"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ticket asociado</label>
              <input
                type="text"
                name="ticketId"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={formData.ticketId}
                onChange={handleChange}
                placeholder="TCK-XXXX"
              />
            </div>
          </div>

          {/* Técnico */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Técnico</label>
            <input
              type="text"
              name="tecnico"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={formData.tecnico}
              onChange={handleChange}
              placeholder="Nombre del técnico responsable"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 text-sm rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 font-medium" 
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Registrar Movimiento'}
            </button>
            <button 
              type="button" 
              onClick={handleCancel} 
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

export default MovimientoForm;