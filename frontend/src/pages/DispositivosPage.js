import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import DispositivoList from '../components/Dispositivos/DispositivoList';
import DispositivoForm from '../components/Dispositivos/DispositivoForm';
import MovimientoForm from '../components/Movimientos/MovimientoForm';

const DispositivosPage = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [showMovimientoForm, setShowMovimientoForm] = useState(false);
  const [editingDispositivo, setEditingDispositivo] = useState(null);
  const [dispositivoSeleccionado, setDispositivoSeleccionado] = useState(null);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    setShowForm(false);
    setShowMovimientoForm(false);
    setEditingDispositivo(null);
    setDispositivoSeleccionado(null);
  };

  const handleEdit = (dispositivo) => {
    setEditingDispositivo(dispositivo);
    setShowForm(true);
  };

  const handleMovimiento = (dispositivo) => {
    setDispositivoSeleccionado(dispositivo);
    setShowMovimientoForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dispositivos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Equipos de cómputo y redes</p>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-blue-700 transition-colors">
          <PlusIcon className="w-4 h-4" />
          Nuevo Dispositivo
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5">
          <DispositivoList 
            key={refreshKey} 
            onRefresh={handleRefresh} 
            onEdit={handleEdit}
            onMovimiento={handleMovimiento}
          />
        </div>
      </div>

      {showForm && (
        <DispositivoForm
          onSuccess={handleRefresh}
          editingDispositivo={editingDispositivo}
          setEditingDispositivo={setEditingDispositivo}
          onClose={() => {
            setShowForm(false);
            setEditingDispositivo(null);
          }}
        />
      )}

      {showMovimientoForm && (
        <MovimientoForm 
          onSuccess={handleRefresh}
          dispositivoPrecargado={dispositivoSeleccionado}
          onClose={() => {
            setShowMovimientoForm(false);
            setDispositivoSeleccionado(null);
          }}
        />
      )}
    </div>
  );
};

export default DispositivosPage;