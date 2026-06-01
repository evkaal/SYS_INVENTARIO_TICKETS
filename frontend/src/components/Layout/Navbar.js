import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Bars3Icon, 
  BellIcon, 
  UserCircleIcon,
  ComputerDesktopIcon 
} from '@heroicons/react/24/outline';

const Navbar = ({ onMenuClick }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 py-2 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
              aria-label="Abrir menú"
            >
              <Bars3Icon className="w-5 h-5" />
            </button>
            
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-1.5 rounded-lg">
                <ComputerDesktopIcon className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  Inventario Inteligente
                </h1>
                <p className="text-xs text-gray-500">
                  Control de mantenimiento y tickets
                </p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-sm font-bold text-gray-900">Inventario</h1>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <BellIcon className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            </button>
            <button className="flex items-center gap-1.5 p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <UserCircleIcon className="w-4 h-4" />
              <span className="hidden md:inline text-xs font-medium">Admin</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;