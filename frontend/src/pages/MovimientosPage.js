import React, { useState } from 'react';
import MovimientoForm from '../components/Movimientos/MovimientoForm';
import HistorialList from '../components/Movimientos/HistorialList';

const MovimientosPage = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showMovimientoForm, setShowMovimientoForm] = useState(false);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const openMovimientoForm = () => {
    setShowMovimientoForm(true);
  };

  const closeMovimientoForm = () => {
    setShowMovimientoForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Movimientos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Registro de entradas, salidas y préstamos</p>
        </div>
        <button 
          onClick={openMovimientoForm} 
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          Nuevo Movimiento
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-base font-semibold text-gray-900">Historial de Movimientos</h3>
          </div>
          <div className="p-5">
            <HistorialList key={refreshKey} />
          </div>
        </div>
      </div>

      {/* Modal para registrar movimiento */}
      {showMovimientoForm && (
        <MovimientoForm 
          onSuccess={handleRefresh}
          onClose={closeMovimientoForm}
        />
      )}
    </div>
  );
};

export default MovimientosPage;