import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification debe usarse dentro de NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  const hideNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-l-4 border-green-500 text-green-800';
      case 'error':
        return 'bg-red-50 border-l-4 border-red-500 text-red-800';
      default:
        return 'bg-blue-50 border-l-4 border-blue-500 text-blue-800';
    }
  };

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}
      
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {notifications.map(({ id, message, type }) => (
          <div
            key={id}
            className={`min-w-[300px] max-w-md flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${getStyles(type)} animate-slide-in`}
            style={{ animation: 'slideInRight 0.3s ease-out' }}
          >
            {getIcon(type)}
            <span className="text-sm font-medium flex-1">{message}</span>
            <button
              onClick={() => hideNotification(id)}
              className="text-gray-400 hover:text-gray-600 transition-colors text-lg font-bold"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </NotificationContext.Provider>
  );
};