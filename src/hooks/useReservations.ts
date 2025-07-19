import { useState, useCallback } from 'react';
import { Reservation } from '../types';

export const useReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const addReservation = useCallback((newReservation: Omit<Reservation, 'id'>) => {
    const reservation: Reservation = {
      ...newReservation,
      id: `reservation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setReservations(prev => [...prev, reservation]);
    return reservation;
  }, []);

  const updateReservation = useCallback((id: string, updatedReservation: Omit<Reservation, 'id'>) => {
    setReservations(prev => 
      prev.map(reservation => 
        reservation.id === id 
          ? { ...updatedReservation, id }
          : reservation
      )
    );
  }, []);

  const deleteReservation = useCallback((id: string) => {
    setReservations(prev => prev.filter(reservation => reservation.id !== id));
  }, []);

  const getReservationsByBed = useCallback((bedId: string) => {
    return reservations.filter(r => r.bedId === bedId);
  }, [reservations]);

  const getActiveReservations = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return reservations.filter(r => 
      r.status === 'confirmed' && 
      today >= r.checkIn && 
      today < r.checkOut
    );
  }, [reservations]);

  return {
    reservations,
    addReservation,
    updateReservation,
    deleteReservation,
    getReservationsByBed,
    getActiveReservations
  };
};