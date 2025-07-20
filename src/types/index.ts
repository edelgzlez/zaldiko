export interface Room {
  id: string;
  name: string;
  type: 'pension' | 'albergue';
  beds: Bed[];
  capacity: number;
}

export interface Bed {
  id: string;
  roomId: string;
  number: number;
  type: 'individual' | 'doble' | 'litera_superior' | 'litera_inferior';
  reservations: Reservation[];
}

export interface Reservation {
  id: string;
  bedId: string;
  checkIn: string;
  checkOut: string;
  guest: Guest;
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: string;
}

export interface Guest {
  name: string;
  lastName: string;
  idNumber: string;
  phone: string;
  email: string;
  age: number | null;
  country: string;
}

export interface DateRange {
  from: string;
  to: string;
}

export interface FilterState {
  type: 'all' | 'pension' | 'albergue';
  roomId: string | null;
  dateRange: DateRange | null;
}