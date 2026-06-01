import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import ConsumibleList from '../components/Consumibles/ConsumibleList';
import ConsumibleForm from '../components/Consumibles/ConsumibleForm';
import MovimientoForm from '../components/Movimientos/MovimientoForm';

const ConsumiblesPage = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [showMovimientoForm, setShowMovimientoForm] = useState(false);
  const [editingConsumible, setEditingConsumible] = useState(null);
  const [consumibleSeleccionado, setConsumibleSeleccionado] = useState(null);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    setShowForm(false);
    setShowMovimientoForm(false);
    setEditingConsumible(null);
    setConsumibleSeleccionado(null);
  };

  const handleEdit = (consumible) => {
    setEditingConsumible(consumible);
    setShowForm(true);
  };

  const handleMovimiento = (consumible) => {
    setConsumibleSeleccionado(consumible);
    setShowMovimientoForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Consumibles</h1>
          <p className="text-sm text-gray-500 mt-0.5">Materiales consumibles y herramientas</p>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-blue-700 transition-colors">
          <PlusIcon className="w-4 h-4" />
          Nuevo Consumible
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5">
          <ConsumibleList 
            key={refreshKey} 
            onRefresh={handleRefresh} 
            onEdit={handleEdit}
            onMovimiento={handleMovimiento}
          />
        </div>
      </div>

      {showForm && (
        <ConsumibleForm
          onSuccess={handleRefresh}
          editingConsumible={editingConsumible}
          setEditingConsumible={setEditingConsumible}
          onClose={() => {
            setShowForm(false);
            setEditingConsumible(null);
          }}
        />
      )}

      {showMovimientoForm && (
        <MovimientoForm 
          onSuccess={handleRefresh}
          consumiblePrecargado={consumibleSeleccionado}
          onClose={() => {
            setShowMovimientoForm(false);
            setConsumibleSeleccionado(null);
          }}
        />
      )}
    </div>
  );
};

export default ConsumiblesPage;