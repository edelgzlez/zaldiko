import { useState, useEffect, useCallback } from 'react';
import { Room, Reservation } from '../types';
import { roomService } from '../services/roomService';
import { reservationService } from '../services/reservationService';

export const useSupabaseData = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      console.log('Supabase URL:', supabaseUrl ? 'Configured' : 'Missing');
      console.log('Supabase Key:', supabaseKey ? 'Configured' : 'Missing');
      
      if (!supabaseUrl || !supabaseKey) {
        setIsSupabaseConnected(false);
        setError('Supabase no está configurado. Haz clic en "Connect to Supabase" para configurar la base de datos.');
        setLoading(false);
        return;
      }

      setIsSupabaseConnected(true);
      console.log('Loading data from Supabase...');

      const [roomsData, reservationsData] = await Promise.all([
        roomService.getAllRoomsWithBeds(),
        reservationService.getAllReservations()
      ]);

      console.log('Loaded rooms:', roomsData);
      console.log('Loaded reservations:', reservationsData);

      // Populate beds with their reservations
      const roomsWithReservations = roomsData.map(room => ({
        ...room,
        beds: room.beds.map(bed => ({
          ...bed,
          reservations: reservationsData.filter(r => r.bedId === bed.id)
        }))
      }));

      console.log('Final rooms with reservations:', roomsWithReservations);

      setRooms(roomsWithReservations);
      setReservations(reservationsData);
    } catch (err) {
      console.error('Error loading data:', err);
      if (err instanceof Error && err.message.includes('Missing Supabase environment variables')) {
        setIsSupabaseConnected(false);
        setError('Supabase no está configurado. Haz clic en "Connect to Supabase" para configurar la base de datos.');
      } else {
        setError(err instanceof Error ? err.message : 'Error cargando datos de la base de datos');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const addReservation = useCallback(async (reservationData: Omit<Reservation, 'id'>) => {
    console.log('Creating reservation with data:', reservationData);

    try {
      const newReservation = await reservationService.createReservation(reservationData);
      if (newReservation) {
        console.log('Reservation created successfully:', newReservation);
        setReservations(prev => [newReservation, ...prev]);
        
        // Update the specific bed's reservations
        setRooms(prev => prev.map(room => ({
          ...room,
          beds: room.beds.map(bed => 
            bed.id === newReservation.bedId
              ? { ...bed, reservations: [...bed.reservations, newReservation] }
              : bed
          )
        })));
        
        return newReservation;
      }
      throw new Error('Failed to create reservation');
    } catch (err) {
      console.error('Error adding reservation:', err);
      throw err;
    }
  }, []);

  const updateReservation = useCallback(async (id: string, reservationData: Omit<Reservation, 'id'>) => {
    console.log('Updating reservation:', id, 'with data:', reservationData);

    try {
      const updatedReservation = await reservationService.updateReservation(id, reservationData);
      if (updatedReservation) {
        console.log('Reservation updated successfully:', updatedReservation);
        setReservations(prev => 
          prev.map(r => r.id === id ? updatedReservation : r)
        );
        
        // Update rooms data
        setRooms(prev => prev.map(room => ({
          ...room,
          beds: room.beds.map(bed => ({
            ...bed,
            reservations: bed.reservations.map(r => 
              r.id === id ? updatedReservation : r
            )
          }))
        })));
        
        return updatedReservation;
      }
      throw new Error('Failed to update reservation');
    } catch (err) {
      console.error('Error updating reservation:', err);
      throw err;
    }
  }, []);

  const deleteReservation = useCallback(async (id: string) => {
    console.log('Deleting reservation:', id);

    try {
      const success = await reservationService.deleteReservation(id);
      if (success) {
        console.log('Reservation deleted successfully');
        setReservations(prev => prev.filter(r => r.id !== id));
        
        // Update rooms data
        setRooms(prev => prev.map(room => ({
          ...room,
          beds: room.beds.map(bed => ({
            ...bed,
            reservations: bed.reservations.filter(r => r.id !== id)
          }))
        })));
        
        return true;
      }
      throw new Error('Failed to delete reservation');
    } catch (err) {
      console.error('Error deleting reservation:', err);
      throw err;
    }
  }, []);

  const refreshData = useCallback(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    rooms,
    reservations,
    loading,
    error,
    isSupabaseConnected,
    addReservation,
    updateReservation,
    deleteReservation,
    refreshData
  };
};