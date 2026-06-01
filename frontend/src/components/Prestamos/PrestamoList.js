import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, CheckCircleIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';
import { prestamosService } from '../../services/prestamosService';
import { useNotification } from '../../context/NotificationContext';

const PrestamoList = ({ onRefresh }) => {
  const { showNotification } = useNotification();
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDevolucionModal, setShowDevolucionModal] = useState(false);
  const [selectedPrestamo, setSelectedPrestamo] = useState(null);
  const [observacionesEntrada, setObservacionesEntrada] = useState('');

  useEffect(() => {
    cargarPrestamos();
  }, []);

  const cargarPrestamos = async () => {
    try {
      setLoading(true);
      const data = await prestamosService.getPrestamosActivos();
      setPrestamos(data);
    } catch (err) {
      console.error(err);
      showNotification('Error al cargar préstamos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDevolucion = (prestamo) => {
    setSelectedPrestamo(prestamo);
    setShowDevolucionModal(true);
  };

  const confirmarDevolucion = async () => {
    try {
      await prestamosService.registrarDevolucion(selectedPrestamo._id, observacionesEntrada);
      showNotification('Devolución registrada exitosamente', 'success');
      setShowDevolucionModal(false);
      setSelectedPrestamo(null);
      setObservacionesEntrada('');
      cargarPrestamos();
      if (onRefresh) onRefresh();
    } catch (err) {
      showNotification('Error al registrar devolución', 'error');
    }
  };

  const filteredPrestamos = prestamos.filter(p =>
    p.materialNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.autorizo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.responsable?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.lugar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.tecnico?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Buscador */}
      <div className="relative mb-6">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por material, autorizo, lugar..."
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabla de préstamos */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Autorizo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lugar/Depto</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado Material</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha salida</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPrestamos.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-12 text-center text-sm text-gray-500">
                  No hay préstamos activos
                </td>
              </tr>
            ) : (
              filteredPrestamos.map((prestamo) => (
                <tr key={prestamo._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {prestamo.materialNombre}
                    {prestamo.marca && <span className="text-xs text-gray-400 ml-1">({prestamo.marca})</span>}
                    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${prestamo.tipoMaterial === 'consumible' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {prestamo.tipoMaterial === 'consumible' ? 'Consumible' : 'Dispositivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{prestamo.responsable || prestamo.autorizo || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{prestamo.lugar || '-'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                      <ArchiveBoxIcon className="w-3 h-3" />
                      {prestamo.estadoMaterial || 'Buen estado'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(prestamo.fechaSalida).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDevolucion(prestamo)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      <CheckCircleIcon className="w-3.5 h-3.5" />
                      Registrar devolución
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de devolución */}
      {showDevolucionModal && selectedPrestamo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center px-5 py-3 border-b">
              <h2 className="text-base font-semibold text-gray-900">Registrar Devolución</h2>
              <button onClick={() => setShowDevolucionModal(false)} className="p-1 text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium">Material: {selectedPrestamo.materialNombre}</p>
                <p className="text-sm">Autorizo: {selectedPrestamo.responsable || selectedPrestamo.autorizo}</p>
                <p className="text-sm">Fecha salida: {new Date(selectedPrestamo.fechaSalida).toLocaleString()}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones de entrada</label>
                <textarea
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none"
                  rows="3"
                  value={observacionesEntrada}
                  onChange={(e) => setObservacionesEntrada(e.target.value)}
                  placeholder="Estado del material al devolver, observaciones..."
                />
              </div>
              
              <div className="flex gap-3">
                <button onClick={confirmarDevolucion} className="flex-1 bg-green-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-green-700">
                  Confirmar devolución
                </button>
                <button onClick={() => setShowDevolucionModal(false)} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 text-sm rounded-lg hover:bg-gray-300">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrestamoList;