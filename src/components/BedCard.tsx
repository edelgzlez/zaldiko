import React from 'react';
import { User, Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { Bed, Reservation } from '../types';

interface BedCardProps {
  bed: Bed;
  roomName: string;
  isAvailable: boolean;
  currentReservation?: Reservation;
  onAddReservation: (bedId: string) => void;
  onEditReservation: (reservation: Reservation) => void;
  onDeleteReservation: (reservationId: string) => void;
  selectedDateRange?: { from: string; to: string } | null;
}

export const BedCard: React.FC<BedCardProps> = ({
  bed,
  roomName,
  isAvailable,
  currentReservation,
  onAddReservation,
  onEditReservation,
  onDeleteReservation,
  selectedDateRange
}) => {
  const getBedTypeDisplay = (type: string) => {
    switch (type) {
      case 'individual': return 'Individual';
      case 'doble': return 'Doble';
      case 'litera_superior': return 'Litera Superior';
      case 'litera_inferior': return 'Litera Inferior';
      default: return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusColor = () => {
    if (!isAvailable) return 'border-red-300 bg-red-50';
    return 'border-green-300 bg-green-50';
  };

  const getStatusIcon = () => {
    if (!isAvailable && currentReservation) {
      return <User className="h-4 w-4 text-red-600" />;
    }
    return <Plus className="h-4 w-4 text-green-600" />;
  };

  return (
    <div className={`border-2 rounded-lg p-4 transition-all hover:shadow-md ${getStatusColor()}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">
            Cama {bed.number}
          </h3>
          <p className="text-xs text-gray-600">{roomName}</p>
          <p className="text-xs text-gray-500">{getBedTypeDisplay(bed.type)}</p>
        </div>
        <div className="flex items-center space-x-1">
          {getStatusIcon()}
          <span className={`text-xs font-medium ${
            isAvailable ? 'text-green-600' : 'text-red-600'
          }`}>
            {isAvailable ? 'Disponible' : 'Ocupada'}
          </span>
        </div>
      </div>

      {currentReservation && (
        <div className="mb-3 p-3 bg-white rounded-md border border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-gray-900">
              {currentReservation.guest.name} {currentReservation.guest.lastName}
            </span>
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>
                {formatDate(currentReservation.checkIn)} - {formatDate(currentReservation.checkOut)}
              </span>
            </div>
            <p>📧 {currentReservation.guest.email}</p>
            <p>📱 {currentReservation.guest.phone}</p>
            {currentReservation.guest.age && <p>👤 {currentReservation.guest.age} años</p>}
            <p>🌍 {currentReservation.guest.country}</p>
          </div>
        </div>
      )}

      <div className="flex space-x-2">
        {isAvailable ? (
          <button
            onClick={() => onAddReservation(bed.id)}
            className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4" />
            <span>Reservar</span>
          </button>
        ) : (
          currentReservation && (
            <>
              <button
                onClick={() => onEditReservation(currentReservation)}
                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <Edit className="h-4 w-4" />
                <span>Editar</span>
              </button>
              <button
                onClick={() => onDeleteReservation(currentReservation.id)}
                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <Trash2 className="h-4 w-4" />
                <span>Eliminar</span>
              </button>
            </>
          )
        )}
      </div>
    </div>
  );
};