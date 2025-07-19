import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, User, Plus } from 'lucide-react';
import { Room, Reservation, Bed } from '../types';

interface CalendarViewProps {
  rooms: Room[];
  reservations: Reservation[];
  onAddReservation: (bedId: string, selectedDate?: string) => void;
  onEditReservation: (reservation: Reservation) => void;
}

interface CalendarDay {
  date: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  reservations: Array<{
    reservation: Reservation;
    bed: Bed;
    room: Room;
  }>;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  rooms,
  reservations,
  onAddReservation,
  onEditReservation
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRoom, setSelectedRoom] = useState<string>('all');

  const allBeds = useMemo(() => {
    return rooms.flatMap(room => 
      room.beds.map(bed => ({ ...bed, room }))
    );
  }, [rooms]);

  const filteredReservations = useMemo(() => {
    return reservations.filter(reservation => {
      if (selectedRoom === 'all') return true;
      const bed = allBeds.find(b => b.id === reservation.bedId);
      return bed?.room.id === selectedRoom;
    });
  }, [reservations, selectedRoom, allBeds]);

  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const today = new Date().toISOString().split('T')[0];
    
    for (let i = 0; i < 42; i++) {
      const currentDay = new Date(startDate);
      currentDay.setDate(startDate.getDate() + i);
      
      const dateString = currentDay.toISOString().split('T')[0];
      const isCurrentMonth = currentDay.getMonth() === month;
      
      const dayReservations = filteredReservations
        .filter(reservation => {
          const checkIn = new Date(reservation.checkIn);
          const checkOut = new Date(reservation.checkOut);
          const dayDate = new Date(dateString);
          
          return dayDate >= checkIn && dayDate < checkOut && reservation.status === 'confirmed';
        })
        .map(reservation => {
          const bed = allBeds.find(b => b.id === reservation.bedId)!;
          return {
            reservation,
            bed,
            room: bed.room
          };
        });

      days.push({
        date: dateString,
        isCurrentMonth,
        isToday: dateString === today,
        reservations: dayReservations
      });
    }
    
    return days;
  };

  const days = getDaysInMonth(currentDate);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const getAvailableBeds = (date: string) => {
    const occupiedBeds = filteredReservations
      .filter(reservation => {
        const checkIn = new Date(reservation.checkIn);
        const checkOut = new Date(reservation.checkOut);
        const dayDate = new Date(date);
        return dayDate >= checkIn && dayDate < checkOut && reservation.status === 'confirmed';
      })
      .map(r => r.bedId);

    return allBeds.filter(bed => {
      if (selectedRoom !== 'all' && bed.room.id !== selectedRoom) return false;
      return !occupiedBeds.includes(bed.id);
    });
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const getOccupancyColor = (reservationsCount: number, totalBeds: number) => {
    if (reservationsCount === 0) return 'bg-green-100 border-green-200';
    if (reservationsCount === totalBeds) return 'bg-red-100 border-red-200';
    return 'bg-yellow-100 border-yellow-200';
  };

  const totalBedsForRoom = selectedRoom === 'all' 
    ? rooms.reduce((sum, room) => sum + room.capacity, 0)
    : rooms.find(r => r.id === selectedRoom)?.capacity || 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Vista de Calendario</h2>
          </div>
          
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas las habitaciones</option>
            {rooms.map(room => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
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
          <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
          <span>Disponible</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
          <span>Parcialmente ocupado</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
          <span>Completamente ocupado</span>
        </div>
      </div>

      {/* Calendario */}
      <div className="grid grid-cols-7 gap-1">
        {/* Cabeceras de días */}
        {dayNames.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 border-b">
            {day}
          </div>
        ))}

        {/* Días del calendario */}
        {days.map((day, index) => {
          const availableBeds = getAvailableBeds(day.date);
          const occupancyColor = getOccupancyColor(day.reservations.length, totalBedsForRoom);
          
          return (
            <div
              key={index}
              className={`min-h-[120px] p-2 border border-gray-200 ${occupancyColor} ${
                !day.isCurrentMonth ? 'opacity-40' : ''
              } ${day.isToday ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-sm font-medium ${
                  day.isToday ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {new Date(day.date).getDate()}
                </span>
                
                {day.isCurrentMonth && availableBeds.length > 0 && (
                  <button
                    onClick={() => onAddReservation(availableBeds[0].id, day.date)}
                    className="p-1 hover:bg-blue-100 rounded transition-colors"
                    title="Añadir reserva"
                  >
                    <Plus className="h-3 w-3 text-blue-600" />
                  </button>
                )}
              </div>

              <div className="space-y-1">
                {day.reservations.slice(0, 3).map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => onEditReservation(item.reservation)}
                    className="text-xs p-1 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 transition-colors"
                    title={`${item.reservation.guest.name} ${item.reservation.guest.lastName} - ${item.room.name} Cama ${item.bed.number}`}
                  >
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span className="truncate">
                        {item.reservation.guest.name} {item.reservation.guest.lastName}
                      </span>
                    </div>
                    <div className="text-xs opacity-75">
                      {item.room.name.replace('Pensión - ', 'P-').replace('Albergue - ', 'A-')} C{item.bed.number}
                    </div>
                  </div>
                ))}
                
                {day.reservations.length > 3 && (
                  <div className="text-xs text-gray-600 text-center">
                    +{day.reservations.length - 3} más
                  </div>
                )}
              </div>

              {day.isCurrentMonth && (
                <div className="mt-2 text-xs text-gray-600 text-center">
                  {availableBeds.length}/{totalBedsForRoom} disponibles
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};