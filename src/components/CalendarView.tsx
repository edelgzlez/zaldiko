import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, User, Plus, Filter } from 'lucide-react';
import { Room, Reservation, Bed } from '../types';

interface CalendarViewProps {
  rooms: Room[];
  reservations: Reservation[];
  onAddReservation: (bedId: string, selectedDate?: string) => void;
  onEditReservation: (reservation: Reservation) => void;
}

interface CalendarDay {
  date: string;
  dayNumber: number;
  isToday: boolean;
}

interface BedReservation {
  bed: Bed;
  room: Room;
  reservation: Reservation | null;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  rooms,
  reservations,
  onAddReservation,
  onEditReservation
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRoomType, setSelectedRoomType] = useState<'all' | 'pension' | 'albergue'>('all');

  // Obtener todos los días del mes actual
  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysCount = new Date(year, month + 1, 0).getDate();
    const today = new Date().toISOString().split('T')[0];
    
    const days: CalendarDay[] = [];
    for (let day = 1; day <= daysCount; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      
      days.push({
        date: dateString,
        dayNumber: day,
        isToday: dateString === today
      });
    }
    
    return days;
  }, [currentDate]);

  // Filtrar habitaciones y obtener todas las camas
  const filteredRoomsAndBeds = useMemo(() => {
    const filteredRooms = rooms.filter(room => 
      selectedRoomType === 'all' || room.type === selectedRoomType
    );

    const bedsWithRooms: BedReservation[] = [];
    filteredRooms.forEach(room => {
      room.beds.forEach(bed => {
        bedsWithRooms.push({
          bed,
          room,
          reservation: null // Se llenará dinámicamente por día
        });
      });
    });

    return bedsWithRooms.sort((a, b) => {
      // Ordenar por tipo de habitación, luego por nombre de habitación, luego por número de cama
      if (a.room.type !== b.room.type) {
        return a.room.type === 'pension' ? -1 : 1;
      }
      if (a.room.name !== b.room.name) {
        return a.room.name.localeCompare(b.room.name);
      }
      return a.bed.number - b.bed.number;
    });
  }, [rooms, selectedRoomType]);

  // Función para obtener la reserva de una cama en una fecha específica
  const getReservationForBedAndDate = (bedId: string, date: string): Reservation | null => {
    return reservations.find(reservation => {
      if (reservation.bedId !== bedId || reservation.status !== 'confirmed') return false;
      
      const checkIn = new Date(reservation.checkIn);
      const checkOut = new Date(reservation.checkOut);
      const currentDate = new Date(date);
      
      return currentDate >= checkIn && currentDate < checkOut;
    }) || null;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const getBedTypeDisplay = (type: string) => {
    switch (type) {
      case 'individual': return 'Ind';
      case 'doble': return 'Dob';
      case 'litera_superior': return 'LS';
      case 'litera_inferior': return 'LI';
      default: return type;
    }
  };

  const getRoomTypeColor = (type: string) => {
    return type === 'pension' ? 'bg-green-50' : 'bg-orange-50';
  };

  const getRoomTypeBorder = (type: string) => {
    return type === 'pension' ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-orange-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Vista de Calendario - Tabla</h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={selectedRoomType}
              onChange={(e) => setSelectedRoomType(e.target.value as 'all' | 'pension' | 'albergue')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">Todas las habitaciones</option>
              <option value="pension">Solo Pensión</option>
              <option value="albergue">Solo Albergue</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <h3 className="text-lg font-medium text-gray-900 min-w-[200px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex items-center space-x-6 mb-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
          <span>Disponible</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>Ocupada</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-200 border-2 border-blue-600 rounded"></div>
          <span>Día actual</span>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full">
          {/* Header de la tabla */}
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 sticky left-0 bg-gray-50 z-10">
                Día
              </th>
              {filteredRoomsAndBeds.map((bedInfo, index) => (
                <th
                  key={`${bedInfo.room.id}-${bedInfo.bed.id}`}
                  className={`px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 min-w-[80px] ${getRoomTypeColor(bedInfo.room.type)} ${getRoomTypeBorder(bedInfo.room.type)}`}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">
                      {bedInfo.room.name.replace('Pensión - ', 'P-').replace('Albergue - ', 'A-')}
                    </span>
                    <span className="text-gray-600">
                      C{bedInfo.bed.number} ({getBedTypeDisplay(bedInfo.bed.type)})
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body de la tabla */}
          <tbody className="bg-white divide-y divide-gray-200">
            {daysInMonth.map((day) => (
              <tr key={day.date} className={day.isToday ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                {/* Columna del día */}
                <td className={`px-3 py-2 whitespace-nowrap text-sm font-medium border-r border-gray-200 sticky left-0 z-10 ${
                  day.isToday ? 'bg-blue-100 text-blue-900' : 'bg-white text-gray-900'
                }`}>
                  <div className="flex flex-col">
                    <span className="text-lg">{day.dayNumber}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(day.date).toLocaleDateString('es-ES', { weekday: 'short' })}
                    </span>
                  </div>
                </td>

                {/* Columnas de las camas */}
                {filteredRoomsAndBeds.map((bedInfo) => {
                  const reservation = getReservationForBedAndDate(bedInfo.bed.id, day.date);
                  const isAvailable = !reservation;

                  return (
                    <td
                      key={`${day.date}-${bedInfo.bed.id}`}
                      className="px-1 py-1 text-center border-r border-gray-200"
                    >
                      {isAvailable ? (
                        <button
                          onClick={() => onAddReservation(bedInfo.bed.id, day.date)}
                          className={`w-full h-12 rounded border-2 border-dashed border-green-300 bg-green-50 hover:bg-green-100 transition-colors flex items-center justify-center group ${
                            day.isToday ? 'border-green-500 bg-green-100' : ''
                          }`}
                          title={`Reservar cama ${bedInfo.bed.number} - ${bedInfo.room.name}`}
                        >
                          <Plus className="h-4 w-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onEditReservation(reservation)}
                          className={`w-full h-12 rounded bg-blue-500 hover:bg-blue-600 transition-colors flex flex-col items-center justify-center text-white text-xs p-1 ${
                            day.isToday ? 'ring-2 ring-blue-600' : ''
                          }`}
                          title={`${reservation.guest.name} ${reservation.guest.lastName} - ${reservation.guest.email}`}
                        >
                          <User className="h-3 w-3 mb-1" />
                          <span className="truncate w-full">
                            {reservation.guest.name.split(' ')[0]}
                          </span>
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Estadísticas del mes */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="bg-gray-50 p-3 rounded-lg">
          <span className="font-medium text-gray-700">Total de camas:</span>
          <span className="ml-2 text-gray-900">{filteredRoomsAndBeds.length}</span>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <span className="font-medium text-gray-700">Días en el mes:</span>
          <span className="ml-2 text-gray-900">{daysInMonth.length}</span>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <span className="font-medium text-gray-700">Reservas activas:</span>
          <span className="ml-2 text-gray-900">
            {reservations.filter(r => {
              const checkIn = new Date(r.checkIn);
              const checkOut = new Date(r.checkOut);
              const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
              const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
              
              return r.status === 'confirmed' && checkIn <= monthEnd && checkOut >= monthStart;
            }).length}
          </span>
        </div>
      </div>
    </div>
  );
};