import React from 'react';
import { ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const ConsumibleCard = ({ consumible }) => {
  const porcentajeStock = Math.min((consumible.stock / (consumible.stockMinimo * 2)) * 100, 100);
  
  const getStatusIcon = () => {
    if (consumible.stock === 0) return <XCircleIcon className="w-4 h-4 text-red-500" />;
    if (consumible.stock <= consumible.stockMinimo) return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />;
    return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
  };

  const getStatusColor = () => {
    if (consumible.stock === 0) return 'border-l-red-500';
    if (consumible.stock <= consumible.stockMinimo) return 'border-l-yellow-500';
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
          <span className="text-xl font-bold text-gray-900">{consumible.stock}</span>
          <span className="text-xs text-gray-500">{consumible.unidad}</span>
        </div>
        
        <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full ${
              consumible.stock === 0 ? 'bg-red-500' : 
              consumible.stock <= consumible.stockMinimo ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${porcentajeStock}%` }}
          ></div>
        </div>
        
        <div className="mt-1 text-xs text-gray-500">
          Stock mínimo: {consumible.stockMinimo} {consumible.unidad}
        </div>
        {consumible.ubicacionActual && (
          <div className="mt-1 text-xs text-gray-400">
            Ubicación: {consumible.ubicacionActual}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsumibleCard;