import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Filter, Eye, EyeOff, User, Plus, X, Bed, Users, Building2 } from 'lucide-react';
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
  dayOfWeek: string;
}

interface DayReservations {
  available: number;
  occupied: number;
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
  const [filters, setFilters] = useState({
    roomType: 'all' as 'all' | 'pension' | 'albergue',
    roomId: 'all' as string,
    bedType: 'all' as 'all' | 'individual' | 'doble' | 'litera_superior' | 'litera_inferior'
  });
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Obtener todos los días del mes actual
  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysCount = new Date(year, month + 1, 0).getDate();
    
    // Fecha actual en zona horaria local
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    const days: CalendarDay[] = [];
    for (let day = 1; day <= daysCount; day++) {
      const date = new Date(year, month, day);
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      days.push({
        date: dateString,
        dayNumber: day,
        isToday: dateString === today,
        dayOfWeek: date.toLocaleDateString('es-ES', { weekday: 'short' })
      });
    }
    
    return days;
  }, [currentDate]);

  // Filtrar habitaciones y obtener todas las camas
  const filteredRoomsAndBeds = useMemo(() => {
    let filteredRooms = rooms;
    
    // Filtrar por tipo de habitación
    if (filters.roomType !== 'all') {
      filteredRooms = filteredRooms.filter(room => room.type === filters.roomType);
    }
    
    // Filtrar por habitación específica
    if (filters.roomId !== 'all') {
      filteredRooms = filteredRooms.filter(room => room.id === filters.roomId);
    }

    const bedsWithRooms: Array<{ bed: Bed; room: Room }> = [];
    filteredRooms.forEach(room => {
      let bedsToAdd = room.beds;
      
      // Filtrar por tipo de cama
      if (filters.bedType !== 'all') {
        bedsToAdd = bedsToAdd.filter(bed => bed.type === filters.bedType);
      }
      
      bedsToAdd.forEach(bed => {
        bedsWithRooms.push({ bed, room });
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
  }, [rooms, filters]);

  // Función para obtener las reservas de un día específico
  const getDayReservations = (date: string): DayReservations => {
    const dayReservations: DayReservations = {
      available: 0,
      occupied: 0,
      reservations: []
    };

    filteredRoomsAndBeds.forEach(({ bed, room }) => {
      const reservation = reservations.find(r => {
        if (r.bedId !== bed.id || r.status !== 'confirmed') return false;
        
        const checkIn = new Date(r.checkIn + 'T00:00:00');
        const checkOut = new Date(r.checkOut + 'T00:00:00');
        const currentDate = new Date(date + 'T00:00:00');
        
        return currentDate >= checkIn && currentDate < checkOut;
      });

      if (reservation) {
        dayReservations.occupied++;
        dayReservations.reservations.push({ reservation, bed, room });
      } else {
        dayReservations.available++;
      }
    });

    return dayReservations;
  };

  // Función para generar colores consistentes para cada huésped
  const getGuestColor = (guestId: string) => {
    let hash = 0;
    for (let i = 0; i < guestId.length; i++) {
      const char = guestId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    const colors = [
      { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-600', light: 'bg-blue-100' },
      { bg: 'bg-purple-500', text: 'text-white', border: 'border-purple-600', light: 'bg-purple-100' },
      { bg: 'bg-green-500', text: 'text-white', border: 'border-green-600', light: 'bg-green-100' },
      { bg: 'bg-red-500', text: 'text-white', border: 'border-red-600', light: 'bg-red-100' },
      { bg: 'bg-yellow-500', text: 'text-white', border: 'border-yellow-600', light: 'bg-yellow-100' },
      { bg: 'bg-pink-500', text: 'text-white', border: 'border-pink-600', light: 'bg-pink-100' },
      { bg: 'bg-indigo-500', text: 'text-white', border: 'border-indigo-600', light: 'bg-indigo-100' },
      { bg: 'bg-teal-500', text: 'text-white', border: 'border-teal-600', light: 'bg-teal-100' },
      { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-600', light: 'bg-orange-100' },
      { bg: 'bg-cyan-500', text: 'text-white', border: 'border-cyan-600', light: 'bg-cyan-100' }
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Obtener habitaciones filtradas por tipo para el selector de habitación específica
  const availableRoomsForSelection = useMemo(() => {
    if (filters.roomType === 'all') {
      return rooms;
    }
    return rooms.filter(room => room.type === filters.roomType);
  }, [rooms, filters.roomType]);

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, [filterType]: value };
      
      // Si cambia el tipo de habitación, resetear habitación específica
      if (filterType === 'roomType') {
        newFilters.roomId = 'all';
      }
      
      return newFilters;
    });
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
      case 'litera_superior': return 'Lit-S';
      case 'litera_inferior': return 'Lit-I';
      default: return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const handleQuickReserve = (date: string) => {
    const dayData = getDayReservations(date);
    if (dayData.available > 0) {
      // Encontrar la primera cama disponible
      const availableBed = filteredRoomsAndBeds.find(({ bed }) => {
        return !dayData.reservations.some(r => r.bed.id === bed.id);
      });
      
      if (availableBed) {
        onAddReservation(availableBed.bed.id, date);
      }
    }
  };

  // Agrupar reservas por huésped para mostrar de forma compacta
  const getCompactReservations = (dayReservations: DayReservations['reservations']) => {
    const guestGroups = new Map<string, {
      guest: any;
      beds: Array<{ bed: Bed; room: Room; reservation: Reservation }>;
      color: any;
    }>();

    dayReservations.forEach(({ reservation, bed, room }) => {
      const guestKey = reservation.guest.idNumber;
      
      if (!guestGroups.has(guestKey)) {
        guestGroups.set(guestKey, {
          guest: reservation.guest,
          beds: [],
          color: getGuestColor(guestKey)
        });
      }
      
      guestGroups.get(guestKey)!.beds.push({ bed, room, reservation });
    });

    return Array.from(guestGroups.values());
  };

  // Función para abrir el modal de detalle del día
  const handleDayClick = (day: CalendarDay) => {
    setSelectedDay(day);
    setIsModalOpen(true);
  };

  // Función para cerrar el modal
  const closeModal = () => {
    setSelectedDay(null);
    setIsModalOpen(false);
  };

  // Obtener datos detallados del día seleccionado
  const getDetailedDayData = (day: CalendarDay) => {
    if (!day) return null;

    const dayReservations = getDayReservations(day.date);
    
    // Agrupar por habitación
    const roomGroups = new Map<string, {
      room: Room;
      beds: Array<{
        bed: Bed;
        reservation?: Reservation;
        isAvailable: boolean;
      }>;
      available: number;
      occupied: number;
    }>();

    filteredRoomsAndBeds.forEach(({ bed, room }) => {
      if (!roomGroups.has(room.id)) {
        roomGroups.set(room.id, {
          room,
          beds: [],
          available: 0,
          occupied: 0
        });
      }

      const reservation = dayReservations.reservations.find(r => r.bed.id === bed.id);
      const isAvailable = !reservation;

      roomGroups.get(room.id)!.beds.push({
        bed,
        reservation: reservation?.reservation,
        isAvailable
      });

      if (isAvailable) {
        roomGroups.get(room.id)!.available++;
      } else {
        roomGroups.get(room.id)!.occupied++;
      }
    });

    // Ordenar camas por número
    roomGroups.forEach(group => {
      group.beds.sort((a, b) => a.bed.number - b.bed.number);
    });

    return {
      day,
      dayReservations,
      roomGroups: Array.from(roomGroups.values()).sort((a, b) => {
        // Ordenar por tipo (pensión primero) y luego por nombre
        if (a.room.type !== b.room.type) {
          return a.room.type === 'pension' ? -1 : 1;
        }
        return a.room.name.localeCompare(b.room.name);
      })
    };
  };

  const detailedDayData = selectedDay ? getDetailedDayData(selectedDay) : null;

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Vista de Calendario - Compacta</h2>
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

      {/* Filtros */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Tipo de Alojamiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Alojamiento
            </label>
            <select
              value={filters.roomType}
              onChange={(e) => handleFilterChange('roomType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">Todos</option>
              <option value="pension">Pensión</option>
              <option value="albergue">Albergue</option>
            </select>
          </div>

          {/* Habitación Específica */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Habitación
            </label>
            <select
              value={filters.roomId}
              onChange={(e) => handleFilterChange('roomId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">Todas</option>
              {availableRoomsForSelection.map(room => (
                <option key={room.id} value={room.id}>
                  {room.name.replace('Pensión - ', '').replace('Albergue - ', '')} ({room.capacity} camas)
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de Cama */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Cama
            </label>
            <select
              value={filters.bedType}
              onChange={(e) => handleFilterChange('bedType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">Todos los tipos</option>
              <option value="individual">Individual</option>
              <option value="doble">Doble</option>
              <option value="litera_superior">Litera Superior</option>
              <option value="litera_inferior">Litera Inferior</option>
            </select>
          </div>

          {/* Toggle Solo Disponibles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vista
            </label>
            <button
              onClick={() => setShowAvailableOnly(!showAvailableOnly)}
              className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                showAvailableOnly
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300'
              }`}
            >
              {showAvailableOnly ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              <span>{showAvailableOnly ? 'Solo Disponibles' : 'Todos los Días'}</span>
            </button>
          </div>

          {/* Botón Limpiar Filtros */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilters({
                  roomType: 'all',
                  roomId: 'all',
                  bedType: 'all'
                });
                setShowAvailableOnly(false);
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
        
        {/* Resumen de filtros activos */}
        {(filters.roomType !== 'all' || filters.roomId !== 'all' || filters.bedType !== 'all' || showAvailableOnly) && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Filtros activos:</strong>
              {filters.roomType !== 'all' && ` Tipo: ${filters.roomType === 'pension' ? 'Pensión' : 'Albergue'}`}
              {filters.roomId !== 'all' && ` | Habitación: ${availableRoomsForSelection.find(r => r.id === filters.roomId)?.name.replace('Pensión - ', '').replace('Albergue - ', '')}`}
              {filters.bedType !== 'all' && ` | Cama: ${getBedTypeDisplay(filters.bedType)}`}
              {showAvailableOnly && ` | Vista: Solo días con disponibilidad`}
            </p>
          </div>
        )}
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
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-200 border-2 border-yellow-500 border-dashed rounded"></div>
          <span>Check-out hoy</span>
        </div>
      </div>

      {/* Calendario Compacto */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {daysInMonth
          .filter(day => {
            if (!showAvailableOnly) return true;
            const dayData = getDayReservations(day.date);
            return dayData.available > 0;
          })
          .map((day) => {
            const dayData = getDayReservations(day.date);
            const totalBeds = filteredRoomsAndBeds.length;
            const occupancyRate = totalBeds > 0 ? Math.round((dayData.occupied / totalBeds) * 100) : 0;
            const compactReservations = getCompactReservations(dayData.reservations);

            return (
              <div
                key={day.date}
                className={`border-2 rounded-lg p-3 transition-all hover:shadow-md ${
                  day.isToday 
                    ? 'border-blue-500 bg-blue-50' 
                    : dayData.available === 0 
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                } cursor-pointer`}
                onClick={() => handleDayClick(day)}
              >
                {/* Header del día */}
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className={`text-lg font-bold ${day.isToday ? 'text-blue-900' : 'text-gray-900'}`}>
                      {day.dayNumber}
                    </h3>
                    <p className="text-xs text-gray-600">{day.dayOfWeek}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${
                      dayData.available > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {dayData.available} / {totalBeds}
                    </div>
                    <p className="text-xs text-gray-500">{occupancyRate}%</p>
                  </div>
                </div>

                {/* Reservas compactas por huésped */}
                <div className="space-y-1 mb-3 min-h-[80px] max-h-[120px] overflow-y-auto">
                  {compactReservations.map((guestGroup) => {
                    const hasCheckoutToday = guestGroup.beds.some(({ reservation }) => 
                      reservation.checkOut === day.date
                    );
                    
                    return (
                      <div
                        key={guestGroup.guest.idNumber}
                        className={`p-2 rounded text-xs ${guestGroup.color.bg} ${guestGroup.color.text} hover:opacity-90 transition-opacity cursor-pointer ${
                          hasCheckoutToday ? `border-2 border-dashed ${guestGroup.color.border}` : ''
                        }`}
                        onClick={() => onEditReservation(guestGroup.beds[0].reservation)}
                        title={`${guestGroup.guest.name} ${guestGroup.guest.lastName} - ${guestGroup.guest.email} - ${guestGroup.beds.length} cama(s) - Check-out: ${formatDate(guestGroup.beds[0].reservation.checkOut)}`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium truncate">
                            {guestGroup.guest.name.split(' ')[0]} {guestGroup.guest.lastName.split(' ')[0]}
                          </span>
                          <span className="text-xs opacity-75 ml-1">
                            {guestGroup.beds.length > 1 ? `${guestGroup.beds.length} camas` : '1 cama'}
                          </span>
                        </div>
                        
                        {/* Mostrar habitaciones de forma compacta */}
                        <div className="text-xs opacity-75 mt-1 truncate">
                          {guestGroup.beds.map(({ bed, room }, index) => (
                            <span key={bed.id}>
                              {room.name.replace('Pensión - ', 'P-').replace('Albergue - ', 'A-')}C{bed.number}
                              {index < guestGroup.beds.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                        
                        {hasCheckoutToday && (
                          <div className="text-xs opacity-75 mt-1">
                            ✈️ Check-out hoy
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Botón de reserva rápida */}
                {dayData.available > 0 && (
                  <button
                    onClick={() => handleQuickReserve(day.date)}
                    className="w-full px-3 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors flex items-center justify-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Reservar ({dayData.available})</span>
                  </button>
                )}

                {dayData.available === 0 && (
                  <div className="w-full px-3 py-2 bg-red-100 text-red-700 text-sm font-medium rounded text-center">
                    Completo
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Estadísticas del mes */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
        <div className="bg-gray-50 p-3 rounded-lg">
          <span className="font-medium text-gray-700">Total de camas filtradas:</span>
          <span className="ml-2 text-gray-900">{filteredRoomsAndBeds.length}</span>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <span className="font-medium text-gray-700">Días en el mes:</span>
          <span className="ml-2 text-gray-900">{daysInMonth.length}</span>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <span className="font-medium text-gray-700">Días mostrados:</span>
          <span className="ml-2 text-gray-900">
            {daysInMonth.filter(day => {
              if (!showAvailableOnly) return true;
              const dayData = getDayReservations(day.date);
              return dayData.available > 0;
            }).length}
          </span>
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

      {/* Modal de Detalle del Día */}
      {isModalOpen && selectedDay && detailedDayData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-4">
                <Calendar className="h-6 w-6 text-blue-600" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedDay.dayNumber} de {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {selectedDay.dayOfWeek} • {detailedDayData.dayReservations.available} disponibles de {filteredRoomsAndBeds.length} camas
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Resumen General */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Bed className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">Total Camas</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900 mt-1">{filteredRoomsAndBeds.length}</p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Plus className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-900">Disponibles</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900 mt-1">{detailedDayData.dayReservations.available}</p>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-red-600" />
                    <span className="font-semibold text-red-900">Ocupadas</span>
                  </div>
                  <p className="text-2xl font-bold text-red-900 mt-1">{detailedDayData.dayReservations.occupied}</p>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold text-purple-900">Ocupación</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-900 mt-1">
                    {Math.round((detailedDayData.dayReservations.occupied / filteredRoomsAndBeds.length) * 100)}%
                  </p>
                </div>
              </div>

              {/* Detalle por Habitación */}
              <div className="space-y-6">
                {detailedDayData.roomGroups.map((roomGroup) => (
                  <div key={roomGroup.room.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Header de la Habitación */}
                    <div className={`p-4 ${
                      roomGroup.room.type === 'pension' 
                        ? 'bg-green-50 border-b border-green-200' 
                        : 'bg-orange-50 border-b border-orange-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Building2 className={`h-5 w-5 ${
                            roomGroup.room.type === 'pension' ? 'text-green-600' : 'text-orange-600'
                          }`} />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {roomGroup.room.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Capacidad: {roomGroup.room.capacity} camas
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <p className="text-sm font-medium text-green-600">Disponibles</p>
                              <p className="text-xl font-bold text-green-600">{roomGroup.available}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-red-600">Ocupadas</p>
                              <p className="text-xl font-bold text-red-600">{roomGroup.occupied}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-gray-600">Ocupación</p>
                              <p className="text-xl font-bold text-gray-900">
                                {Math.round((roomGroup.occupied / roomGroup.room.capacity) * 100)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Camas de la Habitación */}
                    <div className="p-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {roomGroup.beds.map(({ bed, reservation, isAvailable }) => {
                          const hasCheckoutToday = reservation && reservation.checkOut === selectedDay.date;
                          
                          return (
                            <div
                              key={bed.id}
                              className={`p-3 rounded-lg border-2 transition-all ${
                                isAvailable
                                  ? 'border-green-300 bg-green-50 hover:bg-green-100'
                                  : hasCheckoutToday
                                    ? 'border-yellow-400 border-dashed bg-yellow-50'
                                    : 'border-red-300 bg-red-50'
                              } ${!isAvailable ? 'cursor-pointer hover:shadow-md' : ''}`}
                              onClick={() => {
                                if (!isAvailable && reservation) {
                                  closeModal();
                                  onEditReservation(reservation);
                                } else if (isAvailable) {
                                  closeModal();
                                  onAddReservation(bed.id, selectedDay.date);
                                }
                              }}
                            >
                              {/* Header de la Cama */}
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-gray-900">
                                  Cama {bed.number}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  isAvailable 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {getBedTypeDisplay(bed.type)}
                                </span>
                              </div>

                              {/* Información del Huésped o Disponibilidad */}
                              {isAvailable ? (
                                <div className="text-center">
                                  <Plus className="h-6 w-6 text-green-600 mx-auto mb-1" />
                                  <p className="text-xs text-green-700 font-medium">Disponible</p>
                                  <p className="text-xs text-green-600">Click para reservar</p>
                                </div>
                              ) : reservation && (
                                <div>
                                  <div className="flex items-center space-x-1 mb-1">
                                    <User className="h-3 w-3 text-gray-500" />
                                    <span className="text-xs font-medium text-gray-900 truncate">
                                      {reservation.guest.name.split(' ')[0]} {reservation.guest.lastName.split(' ')[0]}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 truncate mb-1">
                                    {reservation.guest.email}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    Hasta: {formatDate(reservation.checkOut)}
                                  </p>
                                  {hasCheckoutToday && (
                                    <p className="text-xs text-yellow-700 font-medium mt-1">
                                      ✈️ Check-out hoy
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-500 mt-1">
                                    Click para editar
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botón de Reserva Rápida */}
              {detailedDayData.dayReservations.available > 0 && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => {
                      closeModal();
                      handleQuickReserve(selectedDay.date);
                    }}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Reserva Rápida ({detailedDayData.dayReservations.available} disponibles)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};