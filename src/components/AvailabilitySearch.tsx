import React, { useState, useMemo } from 'react';
import { Search, Calendar, Bed, Users } from 'lucide-react';
import { Room, Reservation } from '../types';

interface AvailabilitySearchProps {
  rooms: Room[];
  reservations: Reservation[];
  onAddReservation: (bedId: string, checkIn?: string, checkOut?: string) => void;
}

interface AvailabilityResult {
  room: Room;
  availableBeds: Array<{
    bed: any;
    isAvailable: boolean;
    conflictingReservations: Reservation[];
  }>;
}

export const AvailabilitySearch: React.FC<AvailabilitySearchProps> = ({
  rooms,
  reservations,
  onAddReservation
}) => {
  const [searchDates, setSearchDates] = useState({
    checkIn: '',
    checkOut: ''
  });
  const [searchType, setSearchType] = useState<'all' | 'pension' | 'albergue'>('all');

  const searchResults = useMemo(() => {
    if (!searchDates.checkIn || !searchDates.checkOut) return [];

    const checkInDate = new Date(searchDates.checkIn);
    const checkOutDate = new Date(searchDates.checkOut);

    const filteredRooms = rooms.filter(room => 
      searchType === 'all' || room.type === searchType
    );

    return filteredRooms.map(room => {
      const availableBeds = room.beds.map(bed => {
        const conflictingReservations = reservations.filter(reservation => {
          if (reservation.bedId !== bed.id || reservation.status !== 'confirmed') return false;
          
          const resCheckIn = new Date(reservation.checkIn);
          const resCheckOut = new Date(reservation.checkOut);
          
          // Check if there's any overlap
          return checkInDate < resCheckOut && checkOutDate > resCheckIn;
        });

        return {
          bed,
          isAvailable: conflictingReservations.length === 0,
          conflictingReservations
        };
      });

      return {
        room,
        availableBeds
      };
    });
  }, [rooms, reservations, searchDates, searchType]);

  const totalAvailable = searchResults.reduce(
    (sum, result) => sum + result.availableBeds.filter(b => b.isAvailable).length,
    0
  );

  const totalSearched = searchResults.reduce(
    (sum, result) => sum + result.availableBeds.length,
    0
  );

  const handleQuickReserve = (bedId: string) => {
    onAddReservation(bedId, searchDates.checkIn, searchDates.checkOut);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getBedTypeDisplay = (type: string) => {
    switch (type) {
      case 'individual': return 'Individual';
      case 'doble': return 'Doble';
      case 'litera_superior': return 'Litera Superior';
      case 'litera_inferior': return 'Litera Inferior';
      default: return type;
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Search className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Búsqueda de Disponibilidad</h2>
      </div>

      {/* Formulario de búsqueda */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Entrada
          </label>
          <input
            type="date"
            min={today}
            value={searchDates.checkIn}
            onChange={(e) => setSearchDates(prev => ({ ...prev, checkIn: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Salida
          </label>
          <input
            type="date"
            min={searchDates.checkIn || today}
            value={searchDates.checkOut}
            onChange={(e) => setSearchDates(prev => ({ ...prev, checkOut: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Alojamiento
          </label>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as 'all' | 'pension' | 'albergue')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos</option>
            <option value="pension">Pensión</option>
            <option value="albergue">Albergue</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setSearchDates({ checkIn: '', checkOut: '' });
              setSearchType('all');
            }}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Resumen de resultados */}
      {searchDates.checkIn && searchDates.checkOut && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-900">
                Búsqueda: {formatDate(searchDates.checkIn)} - {formatDate(searchDates.checkOut)}
              </h3>
              <p className="text-sm text-blue-700">
                {Math.ceil((new Date(searchDates.checkOut).getTime() - new Date(searchDates.checkIn).getTime()) / (1000 * 60 * 60 * 24))} noches
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <Bed className="h-5 w-5 text-blue-600" />
                <span className="text-lg font-semibold text-blue-900">
                  {totalAvailable} / {totalSearched}
                </span>
              </div>
              <p className="text-sm text-blue-700">camas disponibles</p>
            </div>
          </div>
        </div>
      )}

      {/* Resultados */}
      {searchResults.length > 0 && (
        <div className="space-y-6">
          {searchResults.map(result => {
            const availableCount = result.availableBeds.filter(b => b.isAvailable).length;
            
            return (
              <div key={result.room.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{result.room.name}</h3>
                    <p className="text-sm text-gray-600">
                      Capacidad: {result.room.capacity} camas
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-semibold ${
                      availableCount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {availableCount} disponibles
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {result.availableBeds.map(({ bed, isAvailable, conflictingReservations }) => (
                    <div
                      key={bed.id}
                      className={`p-3 rounded-lg border-2 ${
                        isAvailable 
                          ? 'border-green-300 bg-green-50' 
                          : 'border-red-300 bg-red-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">Cama {bed.number}</h4>
                          <p className="text-xs text-gray-600">{getBedTypeDisplay(bed.type)}</p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          isAvailable 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {isAvailable ? 'Disponible' : 'Ocupada'}
                        </span>
                      </div>

                      {!isAvailable && conflictingReservations.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-red-600 font-medium mb-1">Conflictos:</p>
                          {conflictingReservations.map(reservation => (
                            <div key={reservation.id} className="text-xs text-red-700 bg-red-100 p-2 rounded">
                              <div className="flex items-center space-x-1">
                                <Users className="h-3 w-3" />
                                <span>{reservation.guest.name} {reservation.guest.lastName}</span>
                              </div>
                              <div className="flex items-center space-x-1 mt-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(reservation.checkIn)} - {formatDate(reservation.checkOut)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {isAvailable && (
                        <button
                          onClick={() => handleQuickReserve(bed.id)}
                          className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                        >
                          Reservar Ahora
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {searchDates.checkIn && searchDates.checkOut && searchResults.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No se encontraron habitaciones para los criterios seleccionados.</p>
        </div>
      )}
    </div>
  );
};