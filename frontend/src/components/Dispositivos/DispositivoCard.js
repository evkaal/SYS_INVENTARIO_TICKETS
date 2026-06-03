import React from 'react';
import { CheckCircleIcon, ClockIcon, ComputerDesktopIcon, XCircleIcon } from '@heroicons/react/24/outline';

const DispositivoCard = ({ dispositivo }) => {
  const getEstadoIcon = () => {
    if (dispositivo.estadoActual === 'Disponible') return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    if (dispositivo.estadoActual === 'Prestado') return <ClockIcon className="w-5 h-5 text-yellow-500" />;
    if (dispositivo.estadoActual === 'Baja') return <XCircleIcon className="w-5 h-5 text-red-500" />;
    return <ComputerDesktopIcon className="w-5 h-5 text-gray-500" />;
  };

  const getEstadoColor = () => {
    if (dispositivo.estadoActual === 'Disponible') return 'border-l-green-500';
    if (dispositivo.estadoActual === 'Prestado') return 'border-l-yellow-500';
    if (dispositivo.estadoActual === 'Baja') return 'border-l-red-500';
    return 'border-l-gray-500';
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border-l-4 ${getEstadoColor()} p-3 mb-2`}>
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">{dispositivo.numeroDeInventario}</h4>
          <span className="text-xs text-gray-500">{dispositivo.tipo} - {dispositivo.modelo}</span>
          <span className="text-xs text-gray-400 ml-2">| {dispositivo.marca}</span>
        </div>
        {getEstadoIcon()}
      </div>

      <div className="mt-2 space-y-1">
        <p className="text-xs text-gray-600"><span className="font-medium">Serie:</span> {dispositivo.numeroSerie}</p>
        <p className="text-xs text-gray-600"><span className="font-medium">Condición:</span> {dispositivo.condicion || 'En funcionamiento'}</p>
        {dispositivo.ubicacionActual && (
          <p className="text-xs text-gray-600"><span className="font-medium">Ubicación:</span> {dispositivo.ubicacionActual}</p>
        )}
        {dispositivo.fechaSalida && (
          <p className="text-xs text-gray-400">Salida: {new Date(dispositivo.fechaSalida).toLocaleDateString()}</p>
        )}
      </div>
    </div>
  );
};

export default DispositivoCard;
