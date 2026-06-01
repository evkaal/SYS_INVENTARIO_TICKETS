import React, { useState } from 'react';
import TicketForm from '../components/Tickets/TicketForm';
import TicketList from '../components/Tickets/TicketList';

const TicketsPage = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Tickets</h1>
        <p className="text-sm text-gray-500 mt-0.5">Soporte y mantenimiento</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TicketForm onSuccess={handleRefresh} />
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-base font-semibold text-gray-900">Lista de Tickets</h3>
          </div>
          <div className="p-5">
            <TicketList key={refreshKey} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketsPage;