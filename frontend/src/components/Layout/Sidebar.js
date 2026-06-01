import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  CubeIcon,
  ComputerDesktopIcon,
  ArrowsRightLeftIcon,
  ClipboardIcon,
  TicketIcon,
  ClockIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', path: '/', icon: HomeIcon },
  { name: 'Consumibles', path: '/consumibles', icon: CubeIcon },
  { name: 'Dispositivos', path: '/dispositivos', icon: ComputerDesktopIcon },
  { name: 'Movimientos', path: '/movimientos', icon: ArrowsRightLeftIcon },
  { name: 'Préstamos', path: '/prestamos', icon: ClipboardIcon },      // ← NUEVO
  { name: 'Tickets', path: '/tickets', icon: TicketIcon },
  { name: 'Historial', path: '/historial', icon: ClockIcon },
  { name: 'Reportes', path: '/reportes', icon: ChartBarIcon },
];

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      <aside 
        className={`
          fixed left-0 top-0 z-40 h-screen bg-white shadow-xl transition-transform duration-300 ease-in-out overflow-y-auto
          lg:translate-x-0 lg:static lg:z-auto lg:shadow-none lg:w-64
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-1.5 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-800">Inventario</h2>
                <p className="text-xs text-gray-500">Sistema v2.0</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
          
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        onClose();
                      }
                    }}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xs font-bold">V2</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-900">Sistema v2.0</p>
                <p className="text-xs text-gray-500">Control de inventario</p>
              </div>
              <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                <Cog6ToothIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;