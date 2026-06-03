import React, { useEffect, useMemo, useState } from 'react';
import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

const normalize = (value) => String(value || '').trim().replace(/\s+/g, ' ');

const CatalogSelect = ({
  label,
  name,
  value,
  onChange,
  storageKey,
  defaultOptions = [],
  required = false,
  placeholder = 'Seleccionar opción'
}) => {
  const [options, setOptions] = useState(defaultOptions);
  const [newOption, setNewOption] = useState('');
  const [editingValue, setEditingValue] = useState(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setOptions([...new Set(parsed.map(normalize).filter(Boolean))]);
          return;
        }
      } catch (error) {
        console.error('Error al leer catálogo:', error);
      }
    }
    setOptions([...new Set(defaultOptions.map(normalize).filter(Boolean))]);
  }, [storageKey, defaultOptions]);

  const sortedOptions = useMemo(() => [...options].sort((a, b) => a.localeCompare(b)), [options]);

  const saveOptions = (nextOptions) => {
    const cleanOptions = [...new Set(nextOptions.map(normalize).filter(Boolean))];
    setOptions(cleanOptions);
    localStorage.setItem(storageKey, JSON.stringify(cleanOptions));
  };

  const exists = (text, ignoreValue = null) => {
    const key = normalize(text).toLowerCase();
    return options.some(option => option !== ignoreValue && option.toLowerCase() === key);
  };

  const addOption = () => {
    const clean = normalize(newOption);
    if (!clean) return;
    if (exists(clean)) {
      alert('Esa opción ya existe en el catálogo');
      return;
    }
    saveOptions([...options, clean]);
    onChange(clean);
    setNewOption('');
  };

  const startEdit = (option) => {
    setEditingValue(option);
    setEditingText(option);
  };

  const confirmEdit = () => {
    const clean = normalize(editingText);
    if (!clean) return;
    if (exists(clean, editingValue)) {
      alert('Esa opción ya existe en el catálogo');
      return;
    }
    const nextOptions = options.map(option => option === editingValue ? clean : option);
    saveOptions(nextOptions);
    if (value === editingValue) onChange(clean);
    setEditingValue(null);
    setEditingText('');
  };

  const removeOption = (option) => {
    const confirmed = window.confirm(`¿Eliminar "${option}" del catálogo?`);
    if (!confirmed) return;
    saveOptions(options.filter(item => item !== option));
    if (value === option) onChange('');
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <select
        name={name}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      >
        <option value="">{placeholder}</option>
        {sortedOptions.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-2 space-y-2">
        <p className="text-xs font-medium text-gray-600">Editar catálogo</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={newOption}
            onChange={(event) => setNewOption(event.target.value)}
            placeholder="Agregar nueva opción"
          />
          <button
            type="button"
            onClick={addOption}
            className="inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg whitespace-nowrap"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            Agregar
          </button>
        </div>

        <div className="max-h-28 overflow-y-auto space-y-1">
          {sortedOptions.map(option => (
            <div key={option} className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-2 py-1">
              {editingValue === option ? (
                <>
                  <input
                    type="text"
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                    value={editingText}
                    onChange={(event) => setEditingText(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        confirmEdit();
                      }
                    }}
                    autoFocus
                  />
                  <button type="button" onClick={confirmEdit} className="text-xs text-green-700 font-medium">Guardar</button>
                  <button type="button" onClick={() => setEditingValue(null)} className="text-xs text-gray-500">Cancelar</button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-xs text-gray-700">{option}</span>
                  <button type="button" onClick={() => startEdit(option)} className="p-1 text-green-700 hover:bg-green-50 rounded" title="Editar">
                    <PencilIcon className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => removeOption(option)} className="p-1 text-red-700 hover:bg-red-50 rounded" title="Eliminar">
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CatalogSelect;
