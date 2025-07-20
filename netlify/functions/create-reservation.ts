import { supabase } from '../../src/lib/supabase';

// Crear cliente de Supabase específico para Netlify Functions
import { createClient } from '@supabase/supabase-js';
import { Database } from '../../src/lib/database.types';

// En Netlify Functions, las variables de entorno no tienen el prefijo VITE_
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.error('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing');
}

const supabaseClient = createClient<Database>(supabaseUrl!, supabaseAnonKey!);

interface ReservationRequest {
  name: string;
  lastName: string;
  idNumber: string;
  phone: string;
  email: string;
  age: number;
  country: string;
  checkIn: string;
  checkOut: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  reservation?: any;
  error?: string;
}

export const handler = async (event: any, context: any) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Manejar preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Método no permitido. Solo se acepta POST.',
      }),
    };
  }

  try {
    // Parsear el cuerpo de la petición
    const requestData: ReservationRequest = JSON.parse(event.body);
    
    console.log('📧 Datos recibidos de n8n:', requestData);

    // Validar datos obligatorios
    const requiredFields = ['name', 'lastName', 'idNumber', 'phone', 'email', 'country', 'checkIn', 'checkOut'];
    const missingFields = requiredFields.filter(field => !requestData[field]);
    
    if (missingFields.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: `Faltan campos obligatorios: ${missingFields.join(', ')}`,
          missingFields,
        }),
      };
    }

    // Validar formato de fechas
    const checkInDate = new Date(requestData.checkIn);
    const checkOutDate = new Date(requestData.checkOut);
    
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Formato de fechas inválido. Use YYYY-MM-DD.',
        }),
      };
    }

    if (checkOutDate <= checkInDate) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'La fecha de salida debe ser posterior a la fecha de entrada.',
        }),
      };
    }

    console.log('✅ Validación de datos completada');

    // 1. Buscar camas disponibles para las fechas solicitadas
    console.log('🔍 Buscando camas disponibles...');
    
    // Obtener todas las camas
    const { data: beds, error: bedsError } = await supabaseClient
      .from('beds')
      .select(`
        id,
        room_id,
        number,
        type,
        rooms (
          id,
          name,
          type,
          capacity
        )
      `);

    if (bedsError) {
      console.error('❌ Error obteniendo camas:', bedsError);
      throw bedsError;
    }

    console.log(`📊 Total de camas encontradas: ${beds?.length || 0}`);

    // Obtener reservas que se solapan con las fechas solicitadas
    const { data: conflictingReservations, error: reservationsError } = await supabaseClient
      .from('reservations')
      .select('bed_id')
      .eq('status', 'confirmed')
      .or(`check_in.lte.${requestData.checkOut},check_out.gte.${requestData.checkIn}`);

    if (reservationsError) {
      console.error('❌ Error obteniendo reservas:', reservationsError);
      throw reservationsError;
    }

    console.log(`📅 Reservas conflictivas encontradas: ${conflictingReservations?.length || 0}`);

    // Filtrar camas ocupadas
    const occupiedBedIds = new Set(conflictingReservations?.map(r => r.bed_id) || []);
    const availableBeds = beds?.filter(bed => !occupiedBedIds.has(bed.id)) || [];

    console.log(`🛏️ Camas disponibles: ${availableBeds.length}`);

    if (availableBeds.length === 0) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'No hay camas disponibles para las fechas solicitadas.',
        }),
      };
    }

    // Seleccionar la primera cama disponible (puedes implementar lógica más sofisticada aquí)
    const selectedBed = availableBeds[0];
    console.log(`🎯 Cama seleccionada: ${selectedBed.rooms.name} - Cama ${selectedBed.number}`);

    // 2. Crear o actualizar el huésped
    console.log('👤 Procesando información del huésped...');
    
    let guestId: string;

    // Verificar si el huésped ya existe por número de ID
    const { data: existingGuest, error: guestCheckError } = await supabaseClient
      .from('guests')
      .select('id')
      .eq('id_number', requestData.idNumber)
      .single();

    if (guestCheckError && guestCheckError.code !== 'PGRST116') {
      console.error('❌ Error verificando huésped existente:', guestCheckError);
      throw guestCheckError;
    }

    if (existingGuest) {
      guestId = existingGuest.id;
      console.log('👤 Actualizando huésped existente:', guestId);
      
      // Actualizar información del huésped
      const { error: updateError } = await supabaseClient
        .from('guests')
        .update({
          name: requestData.name,
          last_name: requestData.lastName,
          phone: requestData.phone,
          email: requestData.email,
          age: requestData.age || null,
          country: requestData.country,
        })
        .eq('id', guestId);

      if (updateError) {
        console.error('❌ Error actualizando huésped:', updateError);
        throw updateError;
      }
    } else {
      console.log('👤 Creando nuevo huésped...');
      
      // Crear nuevo huésped
      const { data: newGuest, error: guestError } = await supabaseClient
        .from('guests')
        .insert({
          name: requestData.name,
          last_name: requestData.lastName,
          id_number: requestData.idNumber,
          phone: requestData.phone,
          email: requestData.email,
          age: requestData.age || null,
          country: requestData.country,
        })
        .select('id')
        .single();

      if (guestError) {
        console.error('❌ Error creando huésped:', guestError);
        throw guestError;
      }

      guestId = newGuest.id;
      console.log('✅ Nuevo huésped creado:', guestId);
    }

    // 3. Crear la reserva
    console.log('📝 Creando reserva...');
    
    const { data: reservation, error: reservationError } = await supabaseClient
      .from('reservations')
      .insert({
        bed_id: selectedBed.id,
        guest_id: guestId,
        check_in: requestData.checkIn,
        check_out: requestData.checkOut,
        status: 'confirmed',
      })
      .select(`
        *,
        guests (*),
        beds (
          *,
          rooms (*)
        )
      `)
      .single();

    if (reservationError) {
      console.error('❌ Error creando reserva:', reservationError);
      throw reservationError;
    }

    console.log('🎉 ¡Reserva creada exitosamente!');

    // Respuesta exitosa
    const response: ApiResponse = {
      success: true,
      message: `Reserva creada exitosamente para ${requestData.name} ${requestData.lastName}`,
      reservation: {
        id: reservation.id,
        bedId: reservation.bed_id,
        checkIn: reservation.check_in,
        checkOut: reservation.check_out,
        status: reservation.status,
        guest: {
          name: reservation.guests.name,
          lastName: reservation.guests.last_name,
          idNumber: reservation.guests.id_number,
          phone: reservation.guests.phone,
          email: reservation.guests.email,
          age: reservation.guests.age || null,
          country: reservation.guests.country,
        },
        room: {
          name: reservation.beds.rooms.name,
          bedNumber: reservation.beds.number,
          bedType: reservation.beds.type,
        },
      },
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response),
    };

} catch (error: unknown) {
  console.error('💥 Error procesando reserva:', error);

  const errorResponse: ApiResponse = {
    success: false,
    message: 'Error interno del servidor al procesar la reserva.',
    error: error instanceof Error ? error.message : JSON.stringify(error),
  };

  return {
    statusCode: 500,
    headers,
    body: JSON.stringify(errorResponse),
    };
  }
};