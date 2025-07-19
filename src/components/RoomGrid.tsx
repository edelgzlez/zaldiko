import React from 'react';
import { Room, Reservation, FilterState } from '../types';
import { BedCard } from './BedCard';

interface RoomGridProps {
  rooms: Room[];
  reservations: Reservation[];
  filters: FilterState;
  onAddReservation: (bedId: string) => void;
  onEditReservation: (reservation: Reservation) => void;
  onDeleteReservation: (reservationId: string) => void;
}

export const RoomGrid: React.FC<RoomGridProps> = ({
  rooms,
  reservations,
  filters,
  onAddReservation,
  onEditReservation,
  onDeleteReservation
}) => {
  console.log('RoomGrid received rooms:', rooms);
  console.log('RoomGrid received filters:', filters);
  
  const isDateInRange = (checkIn: string, checkOut: string, dateRange: { from: string; to: string }) => {
    const reservationStart = new Date(checkIn);
    const reservationEnd = new Date(checkOut);
    const filterStart = new Date(dateRange.from);
    const filterEnd = new Date(dateRange.to);

    // Check if there's any overlap between the reservation and filter dates
    return reservationStart < filterEnd && reservationEnd > filterStart;
  };

  const isBedAvailable = (bedId: string) => {
    const bedReservations = reservations.filter(r => 
      r.bedId === bedId && r.status === 'confirmed'
    );

    if (!filters.dateRange) {
      // If no date filter, check current date availability
      const today = new Date().toISOString().split('T')[0];
      return !bedReservations.some(r => 
        today >= r.checkIn && today < r.checkOut
      );
    }

    // Check if any reservation overlaps with the filtered date range
    return !bedReservations.some(r => 
      isDateInRange(r.checkIn, r.checkOut, filters.dateRange!)
    );
  };

  const getCurrentReservation = (bedId: string) => {
    const bedReservations = reservations.filter(r => 
      r.bedId === bedId && r.status === 'confirmed'
    );

    if (!filters.dateRange) {
      // If no date filter, get current reservation
      const today = new Date().toISOString().split('T')[0];
      return bedReservations.find(r => 
        today >= r.checkIn && today < r.checkOut
      );
    }

    // Get reservation that overlaps with filtered date range
    return bedReservations.find(r => 
      isDateInRange(r.checkIn, r.checkOut, filters.dateRange!)
    );
  };

  const filteredRooms = rooms.filter(room => {
    if (filters.type !== 'all' && room.type !== filters.type) return false;
    if (filters.roomId && room.id !== filters.roomId) return false;
    return true;
  });

  console.log('Filtered rooms:', filteredRooms);

  const getTypeDisplay = (type: string) => {
    return type === 'pension' ? 'Pensión' : 'Albergue';
  };

  const getTypeColor = (type: string) => {
    return type === 'pension' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-orange-100 text-orange-800 border-orange-200';
  };

  if (filteredRooms.length === 0) {
    console.log('No filtered rooms found. Total rooms:', rooms.length);
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          {rooms.length === 0 
            ? 'No hay habitaciones cargadas desde la base de datos.' 
            : 'No se encontraron habitaciones con los filtros aplicados.'
          }
        </p>
        {rooms.length === 0 && (
          <p className="text-gray-400 text-sm mt-2">
            Verifica que las migraciones de Supabase se hayan ejecutado correctamente.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {filteredRooms.map(room => {
        const availableBeds = room.beds.filter(bed => isBedAvailable(bed.id)).length;
        const occupancyRate = Math.round(((room.capacity - availableBeds) / room.capacity) * 100);

        return (
          <div key={room.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-semibold text-gray-900">{room.name}</h2>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getTypeColor(room.type)}`}>
                  {getTypeDisplay(room.type)}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  Disponibles: <span className="font-semibold text-green-600">{availableBeds}</span> / {room.capacity}
                </p>
                <p className="text-xs text-gray-500">
                  Ocupación: {occupancyRate}%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {room.beds.map(bed => {
                const isAvailable = isBedAvailable(bed.id);
                const currentReservation = getCurrentReservation(bed.id);

                return (
                  <BedCard
                    key={bed.id}
                    bed={bed}
                    roomName={room.name}
                    isAvailable={isAvailable}
                    currentReservation={currentReservation}
                    onAddReservation={onAddReservation}
                    onEditReservation={onEditReservation}
                    onDeleteReservation={onDeleteReservation}
                    selectedDateRange={filters.dateRange}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};