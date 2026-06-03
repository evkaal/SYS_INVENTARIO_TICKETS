import React from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const ConsumibleCard = ({ consumible }) => {
  const cantidad = consumible.stock || 0;
  const porcentajeCantidad = Math.min((cantidad / 20) * 100, 100);

  const getStatusIcon = () => {
    if (cantidad === 0) return <XCircleIcon className="w-4 h-4 text-red-500" />;
    if (cantidad <= 5) return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />;
    return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
  };

  const getStatusColor = () => {
    if (cantidad === 0) return 'border-l-red-500';
    if (cantidad <= 5) return 'border-l-yellow-500';
    return 'border-l-green-500';
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border-l-4 ${getStatusColor()} p-3 mb-2`}>
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">{consumible.nombre}</h4>
          <span className="text-xs text-gray-500">{consumible.categoria}</span>
          {consumible.marca && <span className="text-xs text-gray-400 ml-2">| {consumible.marca}</span>}
        </div>
        {getStatusIcon()}
      </div>

      <div className="mt-2">
        <div className="flex justify-between items-baseline">
          <span className="text-xl font-bold text-gray-900">{cantidad}</span>
          <span className="text-xs text-gray-500">{consumible.unidad}</span>
        </div>

        <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full ${cantidad === 0 ? 'bg-red-500' : cantidad <= 5 ? 'bg-yellow-500' : 'bg-green-500'}`}
            style={{ width: `${porcentajeCantidad}%` }}
          />
        </div>

        <p className="text-xs text-gray-400 mt-1">
          Cantidad registrada en inventario
        </p>
      </div>
    </div>
  );
};

export default ConsumibleCard;
