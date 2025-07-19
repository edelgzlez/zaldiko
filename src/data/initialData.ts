import { Room, Bed } from '../types';

// Generar camas para pensión
const generatePensionBeds = (): Bed[] => {
  const beds: Bed[] = [];
  
  // Habitación 1: 3 camas individuales
  for (let i = 1; i <= 3; i++) {
    beds.push({
      id: `pension-room1-bed${i}`,
      roomId: 'pension-room1',
      number: i,
      type: 'individual',
      reservations: []
    });
  }
  
  // Habitación 2: 3 camas individuales
  for (let i = 1; i <= 3; i++) {
    beds.push({
      id: `pension-room2-bed${i}`,
      roomId: 'pension-room2',
      number: i,
      type: 'individual',
      reservations: []
    });
  }
  
  // Habitación 3: 1 cama doble
  beds.push({
    id: 'pension-room3-bed1',
    roomId: 'pension-room3',
    number: 1,
    type: 'doble',
    reservations: []
  });
  
  return beds;
};

// Generar camas para albergue
const generateAlbergueBeds = (): Bed[] => {
  const beds: Bed[] = [];
  
  // 3 habitaciones de 8 camas cada una (4 literas)
  for (let room = 1; room <= 3; room++) {
    for (let litera = 1; litera <= 4; litera++) {
      // Cama superior
      beds.push({
        id: `albergue-room${room}-litera${litera}-superior`,
        roomId: `albergue-room${room}`,
        number: (litera - 1) * 2 + 1,
        type: 'litera_superior',
        reservations: []
      });
      
      // Cama inferior
      beds.push({
        id: `albergue-room${room}-litera${litera}-inferior`,
        roomId: `albergue-room${room}`,
        number: (litera - 1) * 2 + 2,
        type: 'litera_inferior',
        reservations: []
      });
    }
  }
  
  return beds;
};

export const initialRooms: Room[] = [
  // Pensión
  {
    id: 'pension-room1',
    name: 'Pensión - Habitación 1',
    type: 'pension',
    beds: generatePensionBeds().filter(bed => bed.roomId === 'pension-room1'),
    capacity: 3
  },
  {
    id: 'pension-room2',
    name: 'Pensión - Habitación 2',
    type: 'pension',
    beds: generatePensionBeds().filter(bed => bed.roomId === 'pension-room2'),
    capacity: 3
  },
  {
    id: 'pension-room3',
    name: 'Pensión - Habitación 3',
    type: 'pension',
    beds: generatePensionBeds().filter(bed => bed.roomId === 'pension-room3'),
    capacity: 2
  },
  
  // Albergue
  {
    id: 'albergue-room1',
    name: 'Albergue - Habitación 1',
    type: 'albergue',
    beds: generateAlbergueBeds().filter(bed => bed.roomId === 'albergue-room1'),
    capacity: 8
  },
  {
    id: 'albergue-room2',
    name: 'Albergue - Habitación 2',
    type: 'albergue',
    beds: generateAlbergueBeds().filter(bed => bed.roomId === 'albergue-room2'),
    capacity: 8
  },
  {
    id: 'albergue-room3',
    name: 'Albergue - Habitación 3',
    type: 'albergue',
    beds: generateAlbergueBeds().filter(bed => bed.roomId === 'albergue-room3'),
    capacity: 8
  }
];

export const allBeds: Bed[] = [
  ...generatePensionBeds(),
  ...generateAlbergueBeds()
];