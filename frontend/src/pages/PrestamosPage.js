import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import PrestamoList from '../components/Prestamos/PrestamoList';
import PrestamoForm from '../components/Prestamos/PrestamoForm';

const PrestamosPage = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Préstamos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestión de préstamos de materiales y dispositivos</p>
        </div>
        <button 
          onClick={() => setShowForm(true)} 
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Nuevo Préstamo
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
          <h3 className="text-base font-semibold text-gray-900">Préstamos Activos</h3>
        </div>
        <div className="p-5">
          <PrestamoList key={refreshKey} onRefresh={handleRefresh} />
        </div>
      </div>

      {showForm && (
        <PrestamoForm
          onSuccess={handleRefresh}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default PrestamosPage;