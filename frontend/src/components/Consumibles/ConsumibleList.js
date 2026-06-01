import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, TrashIcon, PencilIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import { consumiblesService } from '../../services/consumiblesService';
import { useNotification } from '../../context/NotificationContext';
import ConfirmDialog from '../UI/ConfirmDialog';

const ConsumibleList = ({ onRefresh, onEdit, onMovimiento }) => {
  const { showNotification } = useNotification();
  const [consumibles, setConsumibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    consumibleId: null,
    consumibleNombre: null
  });

  useEffect(() => {
    cargarConsumibles();
  }, []);

  const cargarConsumibles = async () => {
    try {
      setLoading(true);
      const data = await consumiblesService.getConsumibles();
      setConsumibles(data);
    } catch (err) {
      console.error(err);
      if (showNotification) {
        showNotification('Error al cargar consumibles', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id, nombre) => {
    setConfirmDialog({
      isOpen: true,
      consumibleId: id,
      consumibleNombre: nombre
    });
  };

  const handleDeleteConfirm = async () => {
    const { consumibleId, consumibleNombre } = confirmDialog;
    try {
      await consumiblesService.deleteConsumible(consumibleId);
      if (showNotification) {
        showNotification(`Consumible "${consumibleNombre}" eliminado`, 'success');
      }
      await cargarConsumibles();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      if (showNotification) {
        showNotification('Error al eliminar consumible', 'error');
      }
    } finally {
      setConfirmDialog({ isOpen: false, consumibleId: null, consumibleNombre: null });
    }
  };

  const getStockStatus = (stock, min) => {
    if (stock === 0) return { text: 'Agotado', class: 'bg-red-100 text-red-800' };
    if (stock <= min) return { text: 'Stock Bajo', class: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Disponible', class: 'bg-green-100 text-green-800' };
  };

  const filteredConsumibles = consumibles.filter(c =>
    c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.categoria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.marca?.toLowerCase().includes(searchTerm.toLowerCase())
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
          placeholder="Buscar por nombre, categoría o marca..."
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredConsumibles.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-12 text-center text-sm text-gray-500">
                  No hay consumibles registrados
                </td>
              </tr>
            ) : (
              filteredConsumibles.map((consumible) => {
                const status = getStockStatus(consumible.stock, consumible.stockMinimo);
                return (
                  <tr key={consumible._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{consumible.nombre}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{consumible.categoria}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{consumible.marca || '-'}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                      {consumible.stock} {consumible.unidad}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{consumible.ubicacionActual || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${status.class}`}>
                        {status.text}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onMovimiento && onMovimiento(consumible)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Registrar movimiento"
                        >
                          <ArrowsRightLeftIcon className="w-3.5 h-3.5" />
                          Movimiento
                        </button>
                        <button
                          onClick={() => onEdit && onEdit(consumible)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <PencilIcon className="w-3.5 h-3.5" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteClick(consumible._id, consumible.nombre)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, consumibleId: null, consumibleNombre: null })}
        onConfirm={handleDeleteConfirm}
        title="Confirmar eliminación"
        message={`¿Estás seguro de eliminar el consumible "${confirmDialog.consumibleNombre}"?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </>
  );
};

export default ConsumibleList;