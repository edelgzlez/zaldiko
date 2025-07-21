import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Phone, Mail, Globe, CreditCard, Hash } from 'lucide-react';
import { Reservation, Guest, Bed } from '../types';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bed: Bed | null;
  reservation?: Reservation;
  onSave: (reservation: Omit<Reservation, 'id'>) => void;
  roomName?: string;
  prefilledDates?: { checkIn?: string; checkOut?: string };
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  bed,
  reservation,
  onSave,
  roomName,
  prefilledDates
}) => {
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    guest: {
      name: '',
      lastName: '',
      idNumber: '',
      phone: '',
      email: '',
      age: '',
      country: ''
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (reservation) {
      setFormData({
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut,
        guest: {
          ...reservation.guest,
          age: reservation.guest.age ? reservation.guest.age.toString() : ''
        }
      });
    } else if (prefilledDates?.checkIn || prefilledDates?.checkOut) {
      setFormData(prev => ({
        ...prev,
        checkIn: prefilledDates.checkIn || '',
        checkOut: prefilledDates.checkOut || ''
      }));
    } else {
      setFormData({
        checkIn: '',
        checkOut: '',
        guest: {
          name: '',
          lastName: '',
          idNumber: '',
          phone: '',
          email: '',
          age: '',
          country: ''
        }
      });
    }
    setErrors({});
  }, [reservation, isOpen, prefilledDates]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.checkIn) newErrors.checkIn = 'La fecha de entrada es requerida';
    if (!formData.checkOut) newErrors.checkOut = 'La fecha de salida es requerida';
    if (formData.checkIn && formData.checkOut && formData.checkIn >= formData.checkOut) {
      newErrors.checkOut = 'La fecha de salida debe ser posterior a la de entrada';
    }

    if (!formData.guest.name) newErrors.name = 'El nombre es requerido';
    if (!formData.guest.lastName) newErrors.lastName = 'El apellido es requerido';
    if (!formData.guest.idNumber) newErrors.idNumber = 'El número de ID es requerido';
    if (!formData.guest.phone) newErrors.phone = 'El teléfono es requerido';
    if (!formData.guest.email) newErrors.email = 'El email es requerido';
    if (!formData.guest.country) newErrors.country = 'El país es requerido';

    if (formData.guest.email && !/\S+@\S+\.\S+/.test(formData.guest.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (formData.guest.age && formData.guest.age.trim() !== '' && (parseInt(formData.guest.age) < 1 || parseInt(formData.guest.age) > 120)) {
      newErrors.age = 'La edad debe estar entre 1 y 120 años';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !bed) return;

    console.log('Submitting reservation form with data:', formData);

    const reservationData: Omit<Reservation, 'id'> = {
      bedId: bed.id,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      guest: {
        ...formData.guest,
        age: formData.guest.age ? parseInt(formData.guest.age) : null
      },
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    console.log('Final reservation data:', reservationData);

    onSave(reservationData);
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('guest.')) {
      const guestField = field.replace('guest.', '');
      setFormData(prev => ({
        ...prev,
        guest: {
          ...prev.guest,
          [guestField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[field.replace('guest.', '')]) {
      setErrors(prev => ({
        ...prev,
        [field.replace('guest.', '')]: ''
      }));
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (!isOpen || !bed) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {reservation ? 'Editar Reserva' : 'Nueva Reserva'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información de la cama */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Información de la Cama</h3>
            <p className="text-sm text-gray-600">
              {roomName} - Cama {bed.number}
            </p>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="h-4 w-4 inline mr-1" />
                Fecha de Entrada *
              </label>
              <input
                type="date"
                min={today}
                value={formData.checkIn}
                onChange={(e) => handleInputChange('checkIn', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.checkIn ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.checkIn && <p className="text-red-500 text-xs mt-1">{errors.checkIn}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="h-4 w-4 inline mr-1" />
                Fecha de Salida *
              </label>
              <input
                type="date"
                min={formData.checkIn || today}
                value={formData.checkOut}
                onChange={(e) => handleInputChange('checkOut', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.checkOut ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.checkOut && <p className="text-red-500 text-xs mt-1">{errors.checkOut}</p>}
            </div>
          </div>

          {/* Información del huésped */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <User className="h-4 w-4 mr-2" />
              Información del Huésped
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.guest.name}
                  onChange={(e) => handleInputChange('guest.name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Nombre del huésped"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido *
                </label>
                <input
                  type="text"
                  value={formData.guest.lastName}
                  onChange={(e) => handleInputChange('guest.lastName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.lastName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Apellido del huésped"
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Hash className="h-4 w-4 inline mr-1" />
                  Número de ID *
                </label>
                <input
                  type="text"
                  value={formData.guest.idNumber}
                  onChange={(e) => handleInputChange('guest.idNumber', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.idNumber ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="DNI, pasaporte, etc."
                />
                {errors.idNumber && <p className="text-red-500 text-xs mt-1">{errors.idNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={formData.guest.phone}
                  onChange={(e) => handleInputChange('guest.phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="+34 123 456 789"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.guest.email}
                  onChange={(e) => handleInputChange('guest.email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="email@ejemplo.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Edad (opcional)
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={formData.guest.age}
                  onChange={(e) => handleInputChange('guest.age', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.age ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ej: 25 (opcional)"
                />
                {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Globe className="h-4 w-4 inline mr-1" />
                  País *
                </label>
                <input
                  type="text"
                  value={formData.guest.country}
                  onChange={(e) => handleInputChange('guest.country', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.country ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="España"
                />
                {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {reservation ? 'Actualizar Reserva' : 'Crear Reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};