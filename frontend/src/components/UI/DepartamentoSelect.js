import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, ChevronDownIcon, PlusIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

// Lista de departamentos predefinidos
const departamentosPredefinidos = [
  'Desarrollo Académico',
  'DEPI',
  'Centro de Computo',
  'Centro de Información',
  'Ciencias Básicas',
  'Ciencias de la Tierra',
  'Gestión Tecnológica',
  'Ciencias Económico Administrativo',
  'Ingeniería Electrónica y Eléctrica',
  'Sistemas y Computación',
  'División de Estudios Profesionales',
  'Económico Administrativo',
  'Formación Integral',
  'Ingeniería Industrial',
  'Metal Mecánica',
  'Ingeniería Química y Bioquímica',
  'Planeación y Presupuestación',
  'Comunicación y Difusión',
  'Recursos Financieros',
  'Recursos Humanos',
  'Servicios Escolares',
  'Subdirecciones',
  'Subdirección Académica'
];

const DepartamentoSelect = ({ value, onChange, placeholder = "Seleccionar departamento", required = false, className = "" }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [departamentos, setDepartamentos] = useState([...departamentosPredefinidos]);
  const [filteredDepartamentos, setFilteredDepartamentos] = useState([...departamentosPredefinidos]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newDepartamento, setNewDepartamento] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Cargar departamentos guardados
  useEffect(() => {
    const saved = localStorage.getItem('departamentosPersonalizados');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const todos = [...departamentosPredefinidos, ...parsed];
        setDepartamentos([...new Set(todos)]);
        setFilteredDepartamentos([...new Set(todos)]);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = departamentos.filter(depto =>
        depto.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDepartamentos(filtered);
    } else {
      setFilteredDepartamentos(departamentos);
    }
  }, [searchTerm, departamentos]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsAddingNew(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (depto) => {
    onChange(depto);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleAddNew = () => {
    if (newDepartamento.trim()) {
      const existe = departamentos.some(d => 
        d.toLowerCase() === newDepartamento.toLowerCase().trim()
      );
      if (existe) {
        alert('Este departamento ya existe en la lista');
        return;
      }
      const nuevosDepartamentos = [...departamentos, newDepartamento.trim()];
      setDepartamentos(nuevosDepartamentos);
      setFilteredDepartamentos(nuevosDepartamentos);
      
      const personalizados = nuevosDepartamentos.filter(d => !departamentosPredefinidos.includes(d));
      localStorage.setItem('departamentosPersonalizados', JSON.stringify(personalizados));
      
      onChange(newDepartamento.trim());
      setNewDepartamento('');
      setIsAddingNew(false);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <div className="relative">
      <div className="relative" ref={inputRef}>
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          className={`w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer ${className}`}
          placeholder={value || placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            setIsAddingNew(false);
          }}
          onFocus={() => setIsOpen(true)}
          required={required}
        />
        <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
      
      {isOpen && (
        <div ref={dropdownRef} className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredDepartamentos.length > 0 ? (
            filteredDepartamentos.map((depto, index) => (
              <button
                key={index}
                type="button"
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                onClick={() => handleSelect(depto)}
              >
                {depto}
              </button>
            ))
          ) : (
            <div className="p-3">
              <p className="text-sm text-gray-500">No se encontraron resultados</p>
              <button
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2 mt-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                onClick={() => {
                  setIsAddingNew(true);
                  setNewDepartamento(searchTerm);
                  setSearchTerm('');
                }}
              >
                <PlusIcon className="w-4 h-4" />
                Agregar "{searchTerm}" como nuevo departamento
              </button>
            </div>
          )}
          
          <div className="border-t border-gray-100">
            <button
              type="button"
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
              onClick={() => {
                setIsAddingNew(true);
                setNewDepartamento('');
                setIsOpen(false);
              }}
            >
              <PlusIcon className="w-4 h-4" />
              Agregar nuevo departamento
            </button>
          </div>
        </div>
      )}

      {isAddingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="flex justify-between items-center px-4 py-3 border-b">
              <h3 className="text-sm font-semibold text-gray-900">Agregar nuevo departamento</h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddingNew(false);
                  setNewDepartamento('');
                }}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">Nombre del departamento</label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={newDepartamento}
                onChange={(e) => setNewDepartamento(e.target.value)}
                placeholder="Ej: Dirección General"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddNew();
                  }
                }}
              />
            </div>
            <div className="flex gap-3 px-4 py-3 bg-gray-50 rounded-b-xl">
              <button
                type="button"
                onClick={handleAddNew}
                disabled={!newDepartamento.trim()}
                className="flex-1 bg-blue-600 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Agregar
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingNew(false);
                  setNewDepartamento('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-3 py-1.5 text-sm rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {value && (
        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
          <CheckCircleIcon className="w-3.5 h-3.5" />
          Departamento seleccionado: {value}
        </p>
      )}
    </div>
  );
};

export default DepartamentoSelect;