import React, { useState } from 'react';
import { LoginForm } from './components/LoginForm';
import { Header } from './components/Header';
import { FilterPanel } from './components/FilterPanel';
import { RoomGrid } from './components/RoomGrid';
import { CalendarView } from './components/CalendarView';
import { AvailabilitySearch } from './components/AvailabilitySearch';
import { ReservationModal } from './components/ReservationModal';
import { useSupabaseData } from './hooks/useSupabaseData';
import { calculateStatistics } from './utils/statistics';
import { FilterState, Reservation, Bed } from './types';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState<'calendar' | 'search'>('calendar');
  const [filters, setFilters] = useState<FilterState>({
    type: 'all',
    roomId: null,
    dateRange: null
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [prefilledDates, setPrefilledDates] = useState<{ checkIn?: string; checkOut?: string }>({});

  const {
    rooms,
    reservations,
    loading,
    error,
    isSupabaseConnected,
    addReservation,
    updateReservation,
    deleteReservation,
    refreshData
  } = useSupabaseData();

  const statistics = calculateStatistics(rooms, reservations, filters);

  // Get all beds from rooms for bed selection
  const allBeds = rooms.flatMap(room => room.beds);

  const handleAddReservation = (bedId: string, checkIn?: string, checkOut?: string) => {
    const bed = allBeds.find(b => b.id === bedId);
    if (bed) {
      setSelectedBed(bed);
      setEditingReservation(null);
      setPrefilledDates({ checkIn, checkOut });
      setIsModalOpen(true);
    }
  };

  const handleEditReservation = (reservation: Reservation) => {
    const bed = allBeds.find(b => b.id === reservation.bedId);
    if (bed) {
      setSelectedBed(bed);
      setEditingReservation(reservation);
      setPrefilledDates({});
      setIsModalOpen(true);
    }
  };

  const handleDeleteReservation = (reservationId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta reserva?\n\nEsta acción no se puede deshacer.')) {
      const performDelete = async () => {
        try {
          await deleteReservation(reservationId);
          alert('✅ Reserva eliminada correctamente');
        } catch (error) {
          alert('❌ Error al eliminar la reserva: ' + (error instanceof Error ? error.message : 'Error desconocido'));
        }
      };
      
      performDelete();
    }
  };

  const handleSaveReservation = (reservationData: Omit<Reservation, 'id'>) => {
    const saveReservation = async () => {
      try {
        if (editingReservation) {
          await updateReservation(editingReservation.id, reservationData);
          alert('✅ Reserva actualizada correctamente');
        } else {
          await addReservation(reservationData);
          alert('✅ Reserva creada correctamente');
        }
        setIsModalOpen(false);
        setSelectedBed(null);
        setEditingReservation(null);
      } catch (error) {
        alert('❌ Error al guardar la reserva: ' + (error instanceof Error ? error.message : 'Error desconocido'));
      }
    };
    
    saveReservation();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBed(null);
    setEditingReservation(null);
    setPrefilledDates({});
  };

  const getSelectedRoomName = () => {
    if (!selectedBed) return '';
    const room = rooms.find(r => r.beds.some(b => b.id === selectedBed.id));
    return room ? room.name : '';
  };

  // Mostrar formulario de login si no está autenticado
  if (!isAuthenticated) {
    return <LoginForm onLogin={() => setIsAuthenticated(true)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isSupabaseConnected ? 'Cargando datos de Zaldiko...' : 'Verificando conexión con Supabase...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
          {!isSupabaseConnected && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
              <p className="font-semibold mb-2">🔗 Configuración de Supabase</p>
              <p className="text-sm">
                Para usar la plataforma Zaldiko, necesitas conectar con Supabase:
              </p>
              <ol className="text-sm mt-2 text-left">
                <li>1. Haz clic en "Connect to Supabase" (esquina superior derecha)</li>
                <li>2. Configura tu proyecto Supabase</li>
                <li>3. Las habitaciones y camas se crearán automáticamente</li>
              </ol>
            </div>
          )}
          <button
            onClick={refreshData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            {isSupabaseConnected ? 'Reintentar' : 'Verificar Conexión'}
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <Header {...statistics} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navegación de vistas */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveView('calendar')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === 'calendar'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Vista de Calendario
            </button>
            <button
              onClick={() => setActiveView('search')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === 'search'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Búsqueda Avanzada
            </button>
          </div>
        </div>

        {/* Contenido según la vista activa */}

        {activeView === 'calendar' && (
          <CalendarView
            rooms={rooms}
            reservations={reservations}
            onAddReservation={handleAddReservation}
            onEditReservation={handleEditReservation}
          />
        )}

        {activeView === 'search' && (
          <AvailabilitySearch
            rooms={rooms}
            reservations={reservations}
            onAddReservation={handleAddReservation}
          />
        )}
      </div>

      <ReservationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        bed={selectedBed}
        reservation={editingReservation}
        onSave={handleSaveReservation}
        roomName={getSelectedRoomName()}
        prefilledDates={prefilledDates}
      />
    </div>
  );
}

export default App;