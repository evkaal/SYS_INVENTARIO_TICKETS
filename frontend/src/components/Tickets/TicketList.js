import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { ticketsService } from '../../services/ticketsService';
import ConsumoForm from './ConsumoForm';
import { useNotification } from '../../context/NotificationContext';

const TicketList = () => {
  const { showNotification } = useNotification();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showConsumoModal, setShowConsumoModal] = useState(false);

  useEffect(() => {
    cargarTickets();
    const interval = setInterval(cargarTickets, 5000);
    return () => clearInterval(interval);
  }, []);

  const cargarTickets = async () => {
    try {
      const data = await ticketsService.getTickets();
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizarTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowConsumoModal(true);
  };

  const handleCloseModal = () => {
    setShowConsumoModal(false);
    setSelectedTicket(null);
    cargarTickets(); // Recargar tickets al cerrar
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const ticketsAbiertos = tickets.filter(t => t.estado === 'abierto');
  const ticketsCompletados = tickets.filter(t => t.estado === 'completado');

  return (
    <>
      <div className="space-y-6">
        {ticketsAbiertos.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Activos ({ticketsAbiertos.length})</h3>
            <div className="grid gap-3">
              {ticketsAbiertos.map((ticket) => (
                <div key={ticket.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-100 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">{ticket.id}</span>
                    <span className="inline-flex items-center gap-1 text-xs text-yellow-700">
                      <ClockIcon className="w-3 h-3" />
                      Activo
                    </span>
                  </div>
                  <div className="p-3 space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Técnico:</span> {ticket.tecnico}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Descripción:</span> {ticket.descripcion}
                    </p>
                    <p className="text-xs text-gray-400">{ticket.fecha}</p>
                  </div>
                  <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
                    <button
                      onClick={() => handleFinalizarTicket(ticket)}
                      className="w-full bg-green-600 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Finalizar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {ticketsCompletados.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Completados ({ticketsCompletados.length})</h3>
            <div className="grid gap-3">
              {ticketsCompletados.map((ticket) => (
                <div key={ticket.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden opacity-75">
                  <div className="px-4 py-2 bg-green-50 border-b border-green-100 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">{ticket.id}</span>
                    <span className="inline-flex items-center gap-1 text-xs text-green-700">
                      <CheckCircleIcon className="w-3 h-3" />
                      Completado
                    </span>
                  </div>
                  <div className="p-3 space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Técnico:</span> {ticket.tecnico}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Descripción:</span> {ticket.descripcion}
                    </p>
                    {ticket.materialesUtilizados && ticket.materialesUtilizados.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-500">Materiales utilizados:</p>
                        <ul className="text-xs text-gray-600 list-disc list-inside">
                          {ticket.materialesUtilizados.map((m, idx) => (
                            <li key={idx}>{m.nombre}: {m.cantidad}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tickets.length === 0 && (
          <div className="text-center py-8 text-gray-500">No hay tickets registrados</div>
        )}
      </div>

      {/* Modal para consumo */}
      {showConsumoModal && selectedTicket && (
        <ConsumoForm
          ticket={selectedTicket}
          onClose={handleCloseModal}
          onSuccess={handleCloseModal}
        />
      )}
    </>
  );
};

export default TicketList;