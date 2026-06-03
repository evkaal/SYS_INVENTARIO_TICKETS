import React, { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { consumiblesService } from '../../services/consumiblesService';
import { dispositivosService } from '../../services/dispositivosService';
import { movimientosService } from '../../services/movimientosService';
import { useNotification } from '../../context/NotificationContext';

const initialFormData = {
  tipoMaterial: 'consumible',
  materialId: '',
  dispositivoId: '',
  tipo: 'Entrada',
  cantidad: 1,
  lugar: '',
  motivo: '',
  vale: '',
  ticketId: '',
  tecnico: ''
};

const MovimientoForm = ({ onSuccess, consumiblePrecargado, dispositivoPrecargado, onClose }) => {
  const { showNotification } = useNotification();
  const [consumibles, setConsumibles] = useState([]);
  const [dispositivos, setDispositivos] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (consumiblePrecargado) {
      setFormData(prev => ({
        ...prev,
        tipoMaterial: 'consumible',
        materialId: consumiblePrecargado._id,
        dispositivoId: '',
        cantidad: 1,
        lugar: consumiblePrecargado.ubicacionActual || ''
      }));
    }
  }, [consumiblePrecargado]);

  useEffect(() => {
    if (dispositivoPrecargado) {
      setFormData(prev => ({
        ...prev,
        tipoMaterial: 'dispositivo',
        dispositivoId: dispositivoPrecargado._id,
        materialId: '',
        cantidad: 1,
        lugar: dispositivoPrecargado.ubicacionActual || ''
      }));
    }
  }, [dispositivoPrecargado]);

  const cargarDatos = async () => {
    try {
      const [consumiblesData, dispositivosData] = await Promise.all([
        consumiblesService.getConsumibles(),
        dispositivosService.getDispositivos()
      ]);
      setConsumibles(consumiblesData);
      setDispositivos(dispositivosData);
    } catch (error) {
      console.error(error);
      showNotification('Error al cargar datos para movimiento', 'error');
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === 'tipoMaterial') {
      setFormData(prev => ({ ...prev, tipoMaterial: value, materialId: '', dispositivoId: '', cantidad: 1 }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const selectedConsumible = consumibles.find(item => item._id === formData.materialId);
  const selectedDispositivo = dispositivos.find(item => item._id === formData.dispositivoId);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!['Entrada', 'Salida'].includes(formData.tipo)) {
      showNotification('El movimiento solo puede ser Entrada o Salida', 'error');
      return;
    }

    if (formData.tipoMaterial === 'consumible' && !formData.materialId) {
      showNotification('Seleccione un consumible', 'error');
      return;
    }

    if (formData.tipoMaterial === 'dispositivo' && !formData.dispositivoId) {
      showNotification('Seleccione un dispositivo', 'error');
      return;
    }

    const cantidad = Number(formData.cantidad || 1);
    if (Number.isNaN(cantidad) || cantidad <= 0) {
      showNotification('La cantidad debe ser mayor a 0', 'error');
      return;
    }

    if (formData.tipoMaterial === 'dispositivo' && cantidad !== 1) {
      showNotification('Para dispositivos la cantidad debe ser 1', 'error');
      return;
    }

    setLoading(true);

    try {
      await movimientosService.registrarMovimiento({
        ...formData,
        cantidad,
        materialId: formData.tipoMaterial === 'consumible' ? formData.materialId : null,
        dispositivoId: formData.tipoMaterial === 'dispositivo' ? formData.dispositivoId : null,
        materialNombre: selectedConsumible?.nombre || (selectedDispositivo ? `${selectedDispositivo.tipo} ${selectedDispositivo.modelo}` : ''),
        marca: selectedConsumible?.marca || selectedDispositivo?.marca || ''
      });

      showNotification('Movimiento registrado correctamente', 'success');
      setFormData(initialFormData);
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      showNotification(error.response?.data?.error || 'Error al registrar movimiento', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
          <h2 className="text-base font-semibold text-gray-900">Nuevo Movimiento</h2>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de material</label>
              <select
                name="tipoMaterial"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.tipoMaterial}
                onChange={handleChange}
              >
                <option value="consumible">Consumible</option>
                <option value="dispositivo">Dispositivo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Movimiento</label>
              <select
                name="tipo"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.tipo}
                onChange={handleChange}
              >
                <option value="Entrada">Entrada</option>
                <option value="Salida">Salida</option>
              </select>
            </div>
          </div>

          {formData.tipoMaterial === 'consumible' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Consumible</label>
              <select
                name="materialId"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.materialId}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar consumible</option>
                {consumibles.map(item => (
                  <option key={item._id} value={item._id}>
                    {item.nombre} - Cantidad: {item.stock} {item.unidad}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dispositivo</label>
              <select
                name="dispositivoId"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.dispositivoId}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar dispositivo</option>
                {dispositivos.map(item => (
                  <option key={item._id} value={item._id}>
                    {item.numeroDeInventario} - {item.tipo} {item.modelo} - {item.estadoActual} - {item.condicion || 'En funcionamiento'}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
              <input
                type="number"
                name="cantidad"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.cantidad}
                onChange={handleChange}
                min="1"
                disabled={formData.tipoMaterial === 'dispositivo'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lugar o área</label>
              <input
                type="text"
                name="lugar"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.lugar}
                onChange={handleChange}
                placeholder="Ej: almacén, laboratorio, oficina"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo u observaciones</label>
            <textarea
              name="motivo"
              rows="3"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.motivo}
              onChange={handleChange}
              placeholder="Ej: compra de insumos, salida para uso, mantenimiento"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ticket</label>
              <input
                type="text"
                name="ticketId"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.ticketId}
                onChange={handleChange}
                placeholder="Opcional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Técnico</label>
              <input
                type="text"
                name="tecnico"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.tecnico}
                onChange={handleChange}
                placeholder="Opcional"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Registrar Movimiento'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 text-sm rounded-lg hover:bg-gray-300 font-medium"
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
