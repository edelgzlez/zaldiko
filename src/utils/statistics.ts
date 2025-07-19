import { Room, Reservation, FilterState } from '../types';

export const calculateStatistics = (
  rooms: Room[], 
  reservations: Reservation[], 
  filters: FilterState
) => {
  const today = new Date().toISOString().split('T')[0];
  
  // Filter rooms based on current filters
  const filteredRooms = rooms.filter(room => {
    if (filters.type !== 'all' && room.type !== filters.type) return false;
    if (filters.roomId && room.id !== filters.roomId) return false;
    return true;
  });

  const totalRooms = filteredRooms.length;
  const totalBeds = filteredRooms.reduce((sum, room) => sum + room.capacity, 0);

  // Calculate current guests and occupancy
  const activeReservations = reservations.filter(r => {
    const isActive = r.status === 'confirmed' && today >= r.checkIn && today < r.checkOut;
    
    if (!isActive) return false;
    
    // Check if this reservation is for a bed in our filtered rooms
    const bedRoom = rooms.find(room => 
      room.beds.some(bed => bed.id === r.bedId)
    );
    
    if (!bedRoom) return false;
    
    // Apply filters
    if (filters.type !== 'all' && bedRoom.type !== filters.type) return false;
    if (filters.roomId && bedRoom.id !== filters.roomId) return false;
    
    return true;
  });

  const totalGuests = activeReservations.length;
  const occupancyRate = totalBeds > 0 ? Math.round((totalGuests / totalBeds) * 100) : 0;

  return {
    totalRooms,
    totalBeds,
    totalGuests,
    occupancyRate
  };
};