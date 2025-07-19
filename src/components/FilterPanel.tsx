import React from 'react';
import { Filter, Calendar, Building, Home } from 'lucide-react';
import { FilterState, Room } from '../types';

interface FilterPanelProps {
  filters: FilterState;
  rooms: Room[];
  onFilterChange: (filters: FilterState) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ 
  filters, 
  rooms, 
  onFilterChange 
}) => {
  const handleTypeChange = (type: FilterState['type']) => {
    onFilterChange({
      ...filters,
      type,
      roomId: null // Reset room filter when type changes
    });
  };

  const handleRoomChange = (roomId: string | null) => {
    onFilterChange({
      ...filters,
      roomId
    });
  };

  const handleDateRangeChange = (field: 'from' | 'to', value: string) => {
    onFilterChange({
      ...filters,
      dateRange: {
        from: field === 'from' ? value : filters.dateRange?.from || '',
        to: field === 'to' ? value : filters.dateRange?.to || ''
      }
    });
  };

  const clearDateRange = () => {
    onFilterChange({
      ...filters,
      dateRange: null
    });
  };

  const filteredRooms = filters.type === 'all' 
    ? rooms 
    : rooms.filter(room => room.type === filters.type);

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <Filter className="h-5 w-5 text-gray-500" />
        <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Tipo de alojamiento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Alojamiento
          </label>
          <div className="flex space-x-2">
            <button
              onClick={() => handleTypeChange('all')}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                filters.type === 'all'
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Building className="h-4 w-4 mr-1" />
              Todos
            </button>
            <button
              onClick={() => handleTypeChange('pension')}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                filters.type === 'pension'
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Home className="h-4 w-4 mr-1" />
              Pensión
            </button>
            <button
              onClick={() => handleTypeChange('albergue')}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                filters.type === 'albergue'
                  ? 'bg-orange-100 text-orange-700 border border-orange-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Building className="h-4 w-4 mr-1" />
              Albergue
            </button>
          </div>
        </div>

        {/* Habitación específica */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Habitación
          </label>
          <select
            value={filters.roomId || ''}
            onChange={(e) => handleRoomChange(e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todas las habitaciones</option>
            {filteredRooms.map(room => (
              <option key={room.id} value={room.id}>
                {room.name} ({room.capacity} {room.capacity === 1 ? 'persona' : 'personas'})
              </option>
            ))}
          </select>
        </div>

        {/* Rango de fechas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Entrada
          </label>
          <input
            type="date"
            min={today}
            value={filters.dateRange?.from || ''}
            onChange={(e) => handleDateRangeChange('from', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Salida
          </label>
          <div className="flex space-x-2">
            <input
              type="date"
              min={filters.dateRange?.from || today}
              value={filters.dateRange?.to || ''}
              onChange={(e) => handleDateRangeChange('to', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {filters.dateRange && (
              <button
                onClick={clearDateRange}
                className="px-3 py-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Limpiar fechas"
              >
                <Calendar className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};