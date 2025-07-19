import { supabase, handleSupabaseError } from '../lib/supabase';
import { Room, Bed } from '../types';

export const roomService = {
  async getAllRoomsWithBeds(): Promise<Room[]> {
    try {
      console.log('Loading rooms with beds from Supabase...');
      
      // First check if we have any data at all
      const { count } = await supabase
        .from('rooms')
        .select('*', { count: 'exact', head: true });
      
      console.log('Total rooms count in database:', count);
      
      const { data: rooms, error: roomsError } = await supabase
        .from('rooms')
        .select(`
          *,
          beds (*)
        `)
        .order('type')
        .order('name');

      if (roomsError) throw roomsError;

      console.log('Rooms data from Supabase:', rooms);
      console.log('Raw rooms data structure:', JSON.stringify(rooms, null, 2));

      return rooms.map(room => ({
        id: room.id,
        name: room.name,
        type: room.type as 'pension' | 'albergue',
        capacity: room.capacity,
        beds: room.beds.map((bed: any) => ({
          id: bed.id,
          roomId: bed.room_id,
          number: bed.number,
          type: bed.type as 'individual' | 'doble' | 'litera_superior' | 'litera_inferior',
          reservations: [] // Will be populated by reservation service
        }))
      }));
    } catch (error) {
      console.error('Error in getAllRoomsWithBeds:', error);
      handleSupabaseError(error);
      return [];
    }
  },

  async getAllBeds(): Promise<Bed[]> {
    try {
      const { data: beds, error } = await supabase
        .from('beds')
        .select('*')
        .order('room_id')
        .order('number');

      if (error) throw error;

      return beds.map(bed => ({
        id: bed.id,
        roomId: bed.room_id,
        number: bed.number,
        type: bed.type as 'individual' | 'doble' | 'litera_superior' | 'litera_inferior',
        reservations: [] // Will be populated by reservation service
      }));
    } catch (error) {
      handleSupabaseError(error);
      return [];
    }
  },

  async createRoom(room: Omit<Room, 'id' | 'beds'>): Promise<Room | null> {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert({
          name: room.name,
          type: room.type,
          capacity: room.capacity
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        type: data.type as 'pension' | 'albergue',
        capacity: data.capacity,
        beds: []
      };
    } catch (error) {
      handleSupabaseError(error);
      return null;
    }
  },

  async updateRoom(id: string, updates: Partial<Omit<Room, 'id' | 'beds'>>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('rooms')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      handleSupabaseError(error);
      return false;
    }
  },

  async deleteRoom(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      handleSupabaseError(error);
      return false;
    }
  }
};