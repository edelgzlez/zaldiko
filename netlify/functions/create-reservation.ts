import { createClient } from '@supabase/supabase-js';
import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { Database } from '../../src/lib/database.types';

// Inicializar cliente Supabase con la clave de rol de servicio
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Faltan variables de entorno de Supabase para la Netlify Function');
}

const supabase = createClient<Database>(supabaseUrl!, supabaseServiceRoleKey!, {
  auth: {
    persistSession: false,
  },
});

// Función auxiliar para manejar errores de Supabase
const handleSupabaseError = (error: any, message: string) => {
  console.error(`Error de Supabase en la función: ${message}`, error);
  throw new Error(error.message || `Ocurrió un error: ${message}`);
};

// Lógica para encontrar una cama disponible y crear la reserva
const findAvailableBedAndCreateReservation = async (reservationData: any) => {
  try {
    const { checkIn, checkOut, guest } = reservationData;

    console.log('Buscando cama disponible para:', { checkIn, checkOut, guest: guest.name });

    // 1. Encontrar una cama disponible
    // Obtener todas las camas
    const { data: allBeds, error: bedsError } = await supabase
      .from('beds')
      .select('id, room_id, number, type');
    
    if (bedsError) handleSupabaseError(bedsError, 'al obtener camas');

    console.log(`Total de camas encontradas: ${allBeds?.length || 0}`);

    // Obtener todas las reservas confirmadas que se superponen con las fechas solicitadas
    const { data: overlappingReservations, error: reservationsError } = await supabase
      .from('reservations')
      .select('bed_id')
      .eq('status', 'confirmed')
      .or(`check_in.lte.${checkOut},check_out.gte.${checkIn}`);
    
    if (reservationsError) handleSupabaseError(reservationsError, 'al obtener reservas superpuestas');

    console.log(`Reservas superpuestas encontradas: ${overlappingReservations?.length || 0}`);

    const occupiedBedIds = new Set(overlappingReservations?.map(r => r.bed_id) || []);

    // Encontrar la primera cama disponible
    const availableBed = allBeds?.find(bed => !occupiedBedIds.has(bed.id));

    if (!availableBed) {
      throw new Error('No hay camas disponibles para las fechas seleccionadas.');
    }

    console.log(`Cama disponible encontrada: ${availableBed.id} (Habitación: ${availableBed.room_id}, Número: ${availableBed.number})`);

    const bedId = availableBed.id;

    // 2. Crear o obtener el huésped
    let guestId: string;

    const { data: existingGuest, error: guestCheckError } = await supabase
      .from('guests')
      .select('id')
      .eq('id_number', guest.idNumber)
      .single();

    if (guestCheckError && guestCheckError.code !== 'PGRST116') {
      handleSupabaseError(guestCheckError, 'al verificar huésped existente');
    }

    if (existingGuest) {
      guestId = existingGuest.id;
      console.log(`Huésped existente encontrado: ${guestId}`);
      
      // Actualizar información del huésped existente
      const { error: updateError } = await supabase
        .from('guests')
        .update({
          name: guest.name,
          last_name: guest.lastName,
          phone: guest.phone,
          email: guest.email,
          age: guest.age,
          country: guest.country
        })
        .eq('id', guestId);
      
      if (updateError) handleSupabaseError(updateError, 'al actualizar huésped');
      console.log('Información del huésped actualizada');
    } else {
      // Crear nuevo huésped
      console.log('Creando nuevo huésped');
      const { data: newGuest, error: guestError } = await supabase
        .from('guests')
        .insert({
          name: guest.name,
          last_name: guest.lastName,
          id_number: guest.idNumber,
          phone: guest.phone,
          email: guest.email,
          age: guest.age,
          country: guest.country
        })
        .select('id')
        .single();
      
      if (guestError) handleSupabaseError(guestError, 'al crear nuevo huésped');
      guestId = newGuest!.id;
      console.log(`Nuevo huésped creado: ${guestId}`);
    }

    // 3. Crear la reserva
    console.log('Creando reserva...');
    const { data: newReservation, error: reservationError } = await supabase
      .from('reservations')
      .insert({
        bed_id: bedId,
        guest_id: guestId,
        check_in: checkIn,
        check_out: checkOut,
        status: 'confirmed'
      })
      .select(`
        *,
        guests (*)
      `)
      .single();

    if (reservationError) handleSupabaseError(reservationError, 'al crear reserva');

    console.log(`Reserva creada exitosamente: ${newReservation!.id}`);

    // Formatear la respuesta
    return {
      id: newReservation!.id,
      bedId: newReservation!.bed_id,
      checkIn: newReservation!.check_in,
      checkOut: newReservation!.check_out,
      status: newReservation!.status as 'confirmed' | 'pending' | 'cancelled',
      createdAt: newReservation!.created_at,
      guest: {
        name: newReservation!.guests.name,
        lastName: newReservation!.guests.last_name,
        idNumber: newReservation!.guests.id_number,
        phone: newReservation!.guests.phone,
        email: newReservation!.guests.email,
        age: newReservation!.guests.age,
        country: newReservation!.guests.country
      },
      bedInfo: {
        bedId: availableBed.id,
        bedNumber: availableBed.number,
        roomId: availableBed.room_id
      }
    };

  } catch (error: any) {
    console.error('Error en findAvailableBedAndCreateReservation:', error.message);
    throw error;
  }
};

// El manejador principal de la función Netlify
const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Método no permitido' }),
    };
  }

  try {
    console.log('Función create-reservation iniciada');
    console.log('Body recibido:', event.body);

    const requestBody = JSON.parse(event.body || '{}');

    // Validación básica de los datos entrantes
    const { name, lastName, idNumber, phone, email, age, country, checkIn, checkOut } = requestBody;

    if (!name || !lastName || !idNumber || !phone || !email || !age || !country || !checkIn || !checkOut) {
      console.log('Datos faltantes:', { name, lastName, idNumber, phone, email, age, country, checkIn, checkOut });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false,
          message: 'Faltan datos de reserva obligatorios.',
          missingFields: {
            name: !name,
            lastName: !lastName,
            idNumber: !idNumber,
            phone: !phone,
            email: !email,
            age: !age,
            country: !country,
            checkIn: !checkIn,
            checkOut: !checkOut
          }
        }),
      };
    }

    // Asegurarse de que la edad sea un número
    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false,
          message: 'La edad debe ser un número válido entre 1 y 120.' 
        }),
      };
    }

    // Validar formato de fechas
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false,
          message: 'Las fechas deben estar en formato YYYY-MM-DD válido.' 
        }),
      };
    }

    if (checkOutDate <= checkInDate) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false,
          message: 'La fecha de salida debe ser posterior a la fecha de entrada.' 
        }),
      };
    }

    const reservationData = {
      checkIn,
      checkOut,
      guest: {
        name,
        lastName,
        idNumber,
        phone,
        email,
        age: parsedAge,
        country
      }
    };

    const newReservation = await findAvailableBedAndCreateReservation(reservationData);

    console.log('Reserva creada exitosamente:', newReservation.id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Reserva creada exitosamente',
        reservation: newReservation 
      }),
    };
  } catch (error: any) {
    console.error('Error en la Netlify Function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        message: error.message || 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
    };
  }
};

export { handler };