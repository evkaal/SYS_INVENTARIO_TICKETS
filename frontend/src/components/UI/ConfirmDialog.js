import React from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Eliminar', cancelText = 'Cancelar' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md transform transition-all">
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-100 rounded-full">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
        
        <div className="px-5 py-4">
          <p className="text-sm text-gray-600">{message}</p>
        </div>
        
        <div className="flex gap-3 px-5 py-4 bg-gray-50 rounded-b-xl">
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            {confirmText}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;