import React, { useState, useEffect } from 'react';
import { 
  FunnelIcon, 
  MagnifyingGlassIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClipboardDocumentIcon,
  ArrowUturnLeftIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { movimientosService } from '../../services/movimientosService';
import { useNotification } from '../../context/NotificationContext';

const HistorialList = () => {
  const { showNotification } = useNotification();
  const [movimientos, setMovimientos] = useState([]);
  const [filteredMovimientos, setFilteredMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    cargarHistorial();
  }, []);

  useEffect(() => {
    let resultado = [...movimientos];
    
    if (filter !== 'todos') {
      resultado = resultado.filter(m => m.tipo === filter);
    }
    
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      resultado = resultado.filter(m => 
        m.materialNombre?.toLowerCase().includes(term) ||
        m.tipo?.toLowerCase().includes(term) ||
        m.motivo?.toLowerCase().includes(term) ||
        m.ticketId?.toLowerCase().includes(term) ||
        m.tecnico?.toLowerCase().includes(term) ||
        m.responsable?.toLowerCase().includes(term) ||
        m.lugar?.toLowerCase().includes(term) ||
        m.marca?.toLowerCase().includes(term) ||
        m.vale?.toLowerCase().includes(term) ||
        m.departamento?.toLowerCase().includes(term)
      );
    }
    
    setFilteredMovimientos(resultado);
  }, [movimientos, filter, searchTerm]);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      const data = await movimientosService.getMovimientos();
      const sortedData = data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setMovimientos(sortedData);
      setFilteredMovimientos(sortedData);
    } catch (err) {
      console.error(err);
      if (showNotification) {
        showNotification('Error al cargar el historial', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const getTipoClass = (tipo) => {
    switch(tipo) {
      case 'Entrada': return 'bg-green-100 text-green-800';
      case 'Salida': return 'bg-red-100 text-red-800';
      case 'Prestamo': return 'bg-yellow-100 text-yellow-800';
      case 'Devolucion': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoTexto = (tipo) => {
    switch(tipo) {
      case 'Entrada': return 'Entrada';
      case 'Salida': return 'Salida';
      case 'Prestamo': return 'Préstamo';
      case 'Devolucion': return 'Devolución';
      default: return tipo;
    }
  };

  const getTipoIcono = (tipo) => {
    switch(tipo) {
      case 'Entrada':
        return <ArrowUpIcon className="w-3.5 h-3.5" />;
      case 'Salida':
        return <ArrowDownIcon className="w-3.5 h-3.5" />;
      case 'Prestamo':
        return <ClipboardDocumentIcon className="w-3.5 h-3.5" />;
      case 'Devolucion':
        return <ArrowUturnLeftIcon className="w-3.5 h-3.5" />;
      default:
        return <MinusIcon className="w-3.5 h-3.5" />;
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
    const fechaObj = new Date(fecha);
    if (isNaN(fechaObj.getTime())) return 'Fecha no disponible';
    return fechaObj.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Barra de búsqueda */}
      <div className="mb-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por material, tipo, motivo, ticket, técnico..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
        {searchTerm && (
          <p className="text-xs text-gray-500 mt-1">
            Mostrando {filteredMovimientos.length} de {movimientos.length} resultados
          </p>
        )}
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 mb-4">
        <FunnelIcon className="w-4 h-4 text-gray-500" />
        <select 
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg outline-none bg-white"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="todos">Todos los movimientos</option>
          <option value="Entrada">Entradas (+)</option>
          <option value="Salida">Salidas (-)</option>
          <option value="Prestamo">Préstamos</option>
          <option value="Devolucion">Devoluciones</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo / Observaciones</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable / Técnico</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMovimientos.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-12 text-center text-sm text-gray-500">
                  {searchTerm ? 'No se encontraron resultados' : 'No hay movimientos registrados'}
                </td>
              </tr>
            ) : (
              filteredMovimientos.map((mov) => (
                <tr key={mov._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                    {formatFecha(mov.fechaSalida || mov.fecha)}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {mov.materialNombre}
                    {mov.marca && <span className="text-xs text-gray-400 ml-1">({mov.marca})</span>}
                    {mov.tipoMaterial && (
                      <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${mov.tipoMaterial === 'consumible' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {mov.tipoMaterial === 'consumible' ? 'Consumible' : 'Dispositivo'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full ${getTipoClass(mov.tipo)}`}>
                      {getTipoIcono(mov.tipo)}
                      {getTipoTexto(mov.tipo)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                    {mov.tipo === 'Entrada' ? '+' : ''}{mov.cantidad}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                    <div className="truncate" title={mov.motivo}>
                      {mov.motivo}
                    </div>
                    {mov.vale && (
                      <span className="text-xs text-gray-400">Vale: {mov.vale}</span>
                    )}
                    {mov.observacionesSalida && (
                      <div className="text-xs text-gray-400 mt-0.5 truncate" title={mov.observacionesSalida}>
                        Obs. salida: {mov.observacionesSalida}
                      </div>
                    )}
                    {mov.observacionesEntrada && (
                      <div className="text-xs text-gray-400 mt-0.5 truncate" title={mov.observacionesEntrada}>
                        Obs. entrada: {mov.observacionesEntrada}
                      </div>
                    )}
                    {mov.lugar && (
                      <div className="text-xs text-gray-400">Lugar: {mov.lugar}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {mov.responsable && (
                      <div className="font-medium">Responsable: {mov.responsable}</div>
                    )}
                    {mov.tecnico && (
                      <div className="text-xs text-gray-500">Técnico: {mov.tecnico}</div>
                    )}
                    {mov.ticketId && (
                      <div className="text-xs text-blue-600">Ticket: {mov.ticketId}</div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Resumen */}
      {filteredMovimientos.length > 0 && (
        <div className="mt-4 px-4 py-3 bg-gray-50 rounded-lg">
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="text-gray-600">
              Mostrando: <strong>{filteredMovimientos.length}</strong> de <strong>{movimientos.length}</strong> movimientos
            </span>
            {filter === 'todos' && searchTerm === '' && (
              <>
                <span className="text-gray-600">
                  Entradas: <strong className="text-green-600">{movimientos.filter(m => m.tipo === 'Entrada').length}</strong>
                </span>
                <span className="text-gray-600">
                  Salidas: <strong className="text-red-600">{movimientos.filter(m => m.tipo === 'Salida').length}</strong>
                </span>
                <span className="text-gray-600">
                  Préstamos: <strong className="text-yellow-600">{movimientos.filter(m => m.tipo === 'Prestamo').length}</strong>
                </span>
                <span className="text-gray-600">
                  Devoluciones: <strong className="text-blue-600">{movimientos.filter(m => m.tipo === 'Devolucion').length}</strong>
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorialList;