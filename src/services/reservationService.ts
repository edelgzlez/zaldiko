import { supabase, handleSupabaseError } from '../lib/supabase';
import { Reservation, Guest } from '../types';

export const reservationService = {
  async getAllReservations(): Promise<Reservation[]> {
    try {
      const { data: reservations, error } = await supabase
        .from('reservations')
        .select(`
          *,
          guests (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return reservations.map(reservation => ({
        id: reservation.id,
        bedId: reservation.bed_id,
        checkIn: reservation.check_in,
        checkOut: reservation.check_out,
        status: reservation.status as 'confirmed' | 'pending' | 'cancelled',
        createdAt: reservation.created_at,
        guest: {
          name: reservation.guests.name,
          lastName: reservation.guests.last_name,
          idNumber: reservation.guests.id_number,
          phone: reservation.guests.phone,
          email: reservation.guests.email,
          age: reservation.guests.age,
          country: reservation.guests.country
        }
      }));
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  },

  async createReservation(reservationData: Omit<Reservation, 'id'>): Promise<Reservation | null> {
    try {
      console.log('Creating reservation in database:', reservationData);
      
      // First, create or get the guest
      let guestId: string;
      
      // Check if guest already exists by ID number
      const { data: existingGuest, error: guestCheckError } = await supabase
        .from('guests')
        .select('id')
        .eq('id_number', reservationData.guest.idNumber)
        .single();

      if (guestCheckError && guestCheckError.code !== 'PGRST116') {
        throw guestCheckError;
      }

      if (existingGuest) {
        guestId = existingGuest.id;
        console.log('Using existing guest:', guestId);
        
        // Update existing guest information
        const { error: updateError } = await supabase
          .from('guests')
          .update({
            name: reservationData.guest.name,
            last_name: reservationData.guest.lastName,
            phone: reservationData.guest.phone,
            email: reservationData.guest.email,
            age: reservationData.guest.age,
            country: reservationData.guest.country
          })
          .eq('id', guestId);

        if (updateError) throw updateError;
      } else {
        console.log('Creating new guest');
        // Create new guest
        const { data: newGuest, error: guestError } = await supabase
          .from('guests')
          .insert({
            name: reservationData.guest.name,
            last_name: reservationData.guest.lastName,
            id_number: reservationData.guest.idNumber,
            phone: reservationData.guest.phone,
            email: reservationData.guest.email,
            age: reservationData.guest.age,
            country: reservationData.guest.country
          })
          .select('id')
          .single();

        if (guestError) throw guestError;
        guestId = newGuest.id;
        console.log('New guest created:', guestId);
      }

      console.log('Creating reservation with guest ID:', guestId);
      // Create the reservation
      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .insert({
          bed_id: reservationData.bedId,
          guest_id: guestId,
          check_in: reservationData.checkIn,
          check_out: reservationData.checkOut,
          status: reservationData.status
        })
        .select(`
          *,
          guests (*)
        `)
        .single();

      if (reservationError) throw reservationError;

      console.log('Reservation created in database:', reservation);

      return {
        id: reservation.id,
        bedId: reservation.bed_id,
        checkIn: reservation.check_in,
        checkOut: reservation.check_out,
        status: reservation.status as 'confirmed' | 'pending' | 'cancelled',
        createdAt: reservation.created_at,
        guest: {
          name: reservation.guests.name,
          lastName: reservation.guests.last_name,
          idNumber: reservation.guests.id_number,
          phone: reservation.guests.phone,
          email: reservation.guests.email,
          age: reservation.guests.age,
          country: reservation.guests.country
        }
      };
    } catch (error) {
      handleSupabaseError(error);
      return null;
    }
  },

  async updateReservation(id: string, reservationData: Omit<Reservation, 'id'>): Promise<Reservation | null> {
    try {
      console.log('Updating reservation in database:', id, reservationData);
      
      // Get the current reservation to find the guest
      const { data: currentReservation, error: getCurrentError } = await supabase
        .from('reservations')
        .select('guest_id')
        .eq('id', id)
        .single();

      if (getCurrentError) throw getCurrentError;

      console.log('Found existing reservation with guest:', currentReservation.guest_id);

      // Update guest information
      const { error: guestUpdateError } = await supabase
        .from('guests')
        .update({
          name: reservationData.guest.name,
          last_name: reservationData.guest.lastName,
          id_number: reservationData.guest.idNumber,
          phone: reservationData.guest.phone,
          email: reservationData.guest.email,
          age: reservationData.guest.age,
          country: reservationData.guest.country
        })
        .eq('id', currentReservation.guest_id);

      if (guestUpdateError) throw guestUpdateError;

      console.log('Guest information updated');

      // Update reservation
      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .update({
          bed_id: reservationData.bedId,
          check_in: reservationData.checkIn,
          check_out: reservationData.checkOut,
          status: reservationData.status
        })
        .eq('id', id)
        .select(`
          *,
          guests (*)
        `)
        .single();

      if (reservationError) throw reservationError;

      console.log('Reservation updated in database:', reservation);

      return {
        id: reservation.id,
        bedId: reservation.bed_id,
        checkIn: reservation.check_in,
        checkOut: reservation.check_out,
        status: reservation.status as 'confirmed' | 'pending' | 'cancelled',
        createdAt: reservation.created_at,
        guest: {
          name: reservation.guests.name,
          lastName: reservation.guests.last_name,
          idNumber: reservation.guests.id_number,
          phone: reservation.guests.phone,
          email: reservation.guests.email,
          age: reservation.guests.age,
          country: reservation.guests.country
        }
      };
    } catch (error) {
      handleSupabaseError(error);
      return null;
    }
  },

  async deleteReservation(id: string): Promise<boolean> {
    try {
      console.log('Deleting reservation from database:', id);
      
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      console.log('Reservation deleted from database successfully');
      return true;
    } catch (error) {
      handleSupabaseError(error);
      return false;
    }
  },

  async getReservationsByDateRange(startDate: string, endDate: string): Promise<Reservation[]> {
    try {
      const { data: reservations, error } = await supabase
        .from('reservations')
        .select(`
          *,
          guests (*)
        `)
        .or(`check_in.lte.${endDate},check_out.gte.${startDate}`)
        .eq('status', 'confirmed')
        .order('check_in');

      if (error) throw error;

      return reservations.map(reservation => ({
        id: reservation.id,
        bedId: reservation.bed_id,
        checkIn: reservation.check_in,
        checkOut: reservation.check_out,
        status: reservation.status as 'confirmed' | 'pending' | 'cancelled',
        createdAt: reservation.created_at,
        guest: {
          name: reservation.guests.name,
          lastName: reservation.guests.last_name,
          idNumber: reservation.guests.id_number,
          phone: reservation.guests.phone,
          email: reservation.guests.email,
          age: reservation.guests.age,
          country: reservation.guests.country
        }
      }));
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  }
};