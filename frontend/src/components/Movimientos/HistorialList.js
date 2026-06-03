import React, { useEffect, useState } from 'react';
import { ArrowDownTrayIcon, ArrowUpTrayIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { movimientosService } from '../../services/movimientosService';
import { useNotification } from '../../context/NotificationContext';

const HistorialList = () => {
  const { showNotification } = useNotification();
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('todos');

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      const data = await movimientosService.getMovimientos();
      setMovimientos(data);
    } catch (error) {
      console.error(error);
      showNotification('Error al cargar historial', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, []);

  const getTipoClass = (tipo) => {
    if (tipo === 'Entrada') return 'bg-green-100 text-green-800';
    if (tipo === 'Salida') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getTipoIcon = (tipo) => {
    if (tipo === 'Entrada') return <ArrowDownTrayIcon className="w-3.5 h-3.5" />;
    if (tipo === 'Salida') return <ArrowUpTrayIcon className="w-3.5 h-3.5" />;
    return null;
  };

  const term = searchTerm.toLowerCase();
  const filteredMovimientos = movimientos.filter(movimiento => {
    const matchesSearch =
      movimiento.materialNombre?.toLowerCase().includes(term) ||
      movimiento.marca?.toLowerCase().includes(term) ||
      movimiento.lugar?.toLowerCase().includes(term) ||
      movimiento.tecnico?.toLowerCase().includes(term) ||
      movimiento.ticketId?.toLowerCase().includes(term);

    const matchesFilter = filter === 'todos' || movimiento.tipo === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por material, marca, lugar, técnico o ticket..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <select
          className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option value="todos">Todos</option>
          <option value="Entrada">Entradas</option>
          <option value="Salida">Salidas</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clase</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cantidad</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lugar o área</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Observaciones</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMovimientos.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-12 text-center text-sm text-gray-500">
                  No hay movimientos registrados
                </td>
              </tr>
            ) : (
              filteredMovimientos.map(movimiento => (
                <tr key={movimiento._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getTipoClass(movimiento.tipo)}`}>
                      {getTipoIcon(movimiento.tipo)}
                      {movimiento.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {movimiento.materialNombre}
                    {movimiento.marca && <span className="text-xs text-gray-400 ml-1">({movimiento.marca})</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {movimiento.tipoMaterial === 'consumible' ? 'Consumible' : 'Dispositivo'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right font-semibold">{movimiento.cantidad}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{movimiento.lugar || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {movimiento.observacionesEntrada || movimiento.observacionesSalida || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(movimiento.fecha || movimiento.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="text-gray-600">Mostrando: <strong>{filteredMovimientos.length}</strong> de <strong>{movimientos.length}</strong> movimientos</span>
          {filter === 'todos' && searchTerm === '' && (
            <>
              <span className="text-gray-600">Entradas: <strong className="text-green-600">{movimientos.filter(m => m.tipo === 'Entrada').length}</strong></span>
              <span className="text-gray-600">Salidas: <strong className="text-red-600">{movimientos.filter(m => m.tipo === 'Salida').length}</strong></span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistorialList;
