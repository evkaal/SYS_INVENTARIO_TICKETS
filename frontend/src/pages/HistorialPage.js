import React from 'react';
import HistorialList from '../components/Movimientos/HistorialList';

const HistorialPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Historial</h1>
        <p className="text-sm text-gray-500 mt-0.5">Registro completo de movimientos</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-base font-semibold text-gray-900">Todos los movimientos</h3>
        </div>
        <div className="p-5">
          <HistorialList />
        </div>
      </div>
    </div>
  );
};

export default HistorialPage;