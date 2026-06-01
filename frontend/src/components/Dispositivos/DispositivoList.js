import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, TrashIcon, PencilIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import { dispositivosService } from '../../services/dispositivosService';
import { useNotification } from '../../context/NotificationContext';
import ConfirmDialog from '../UI/ConfirmDialog';

const DispositivoList = ({ onRefresh, onEdit, onMovimiento }) => {
  const { showNotification } = useNotification();
  const [dispositivos, setDispositivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    dispositivoId: null,
    dispositivoNombre: null
  });

  useEffect(() => {
    cargarDispositivos();
  }, []);

  const cargarDispositivos = async () => {
    try {
      setLoading(true);
      const data = await dispositivosService.getDispositivos();
      setDispositivos(data);
    } catch (err) {
      console.error(err);
      if (showNotification) {
        showNotification('Error al cargar dispositivos', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id, nombre) => {
    setConfirmDialog({
      isOpen: true,
      dispositivoId: id,
      dispositivoNombre: nombre
    });
  };

  const handleDeleteConfirm = async () => {
    const { dispositivoId, dispositivoNombre } = confirmDialog;
    try {
      await dispositivosService.deleteDispositivo(dispositivoId);
      if (showNotification) {
        showNotification(`Dispositivo "${dispositivoNombre}" eliminado`, 'success');
      }
      await cargarDispositivos();
      if (onRefresh) onRefresh();
    } catch (err) {
      if (showNotification) {
        showNotification('Error al eliminar dispositivo', 'error');
      }
    } finally {
      setConfirmDialog({ isOpen: false, dispositivoId: null, dispositivoNombre: null });
    }
  };

  const getEstadoClass = (estado) => {
    switch(estado) {
      case 'Disponible': return 'bg-green-100 text-green-800';
      case 'Ocupado': return 'bg-red-100 text-red-800';
      case 'Prestado': return 'bg-yellow-100 text-yellow-800';
      case 'No encontrado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredDispositivos = dispositivos.filter(d =>
    d.numeroDeInventario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.tipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.numeroSerie?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="relative mb-6">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por inventario, tipo, modelo, marca o serie..."
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Inventario</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modelo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marca</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Serie</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredDispositivos.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-12 text-center text-sm text-gray-500">
                  No hay dispositivos registrados
                </td>
              </tr>
            ) : (
              filteredDispositivos.map((dispositivo) => (
                <tr key={dispositivo._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{dispositivo.numeroDeInventario}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{dispositivo.tipo}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{dispositivo.modelo}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{dispositivo.marca}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{dispositivo.numeroSerie}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getEstadoClass(dispositivo.estadoActual)}`}>
                      {dispositivo.estadoActual}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onMovimiento && onMovimiento(dispositivo)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Registrar movimiento"
                      >
                        <ArrowsRightLeftIcon className="w-3.5 h-3.5" />
                        Movimiento
                      </button>
                      <button
                        onClick={() => onEdit && onEdit(dispositivo)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                      >
                        <PencilIcon className="w-3.5 h-3.5" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteClick(dispositivo._id, dispositivo.numeroDeInventario)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, dispositivoId: null, dispositivoNombre: null })}
        onConfirm={handleDeleteConfirm}
        title="Confirmar eliminación"
        message={`¿Eliminar dispositivo "${confirmDialog.dispositivoNombre}"?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </>
  );
};

export default DispositivoList;