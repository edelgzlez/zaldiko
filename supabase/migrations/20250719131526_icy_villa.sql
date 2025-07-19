/*
  # Seed Initial Data for Zaldiko

  1. Insert Rooms
    - Pensión rooms (3 rooms)
    - Albergue rooms (3 rooms)

  2. Insert Beds
    - Pensión beds (individual and double beds)
    - Albergue beds (bunk beds)

  3. Notes
    - This creates the exact structure specified by the user
    - Pensión: 9 people maximum (3+3+2)
    - Albergue: 24 people maximum (8+8+8)
*/

-- Insert Pensión rooms
INSERT INTO rooms (id, name, type, capacity) VALUES
  ('pension-room-1', 'Pensión - Habitación 1', 'pension', 3),
  ('pension-room-2', 'Pensión - Habitación 2', 'pension', 3),
  ('pension-room-3', 'Pensión - Habitación 3', 'pension', 2);

-- Insert Albergue rooms
INSERT INTO rooms (id, name, type, capacity) VALUES
  ('albergue-room-1', 'Albergue - Habitación 1', 'albergue', 8),
  ('albergue-room-2', 'Albergue - Habitación 2', 'albergue', 8),
  ('albergue-room-3', 'Albergue - Habitación 3', 'albergue', 8);

-- Insert Pensión beds
-- Habitación 1: 3 camas individuales
INSERT INTO beds (id, room_id, number, type) VALUES
  ('pension-room-1-bed-1', 'pension-room-1', 1, 'individual'),
  ('pension-room-1-bed-2', 'pension-room-1', 2, 'individual'),
  ('pension-room-1-bed-3', 'pension-room-1', 3, 'individual');

-- Habitación 2: 3 camas individuales
INSERT INTO beds (id, room_id, number, type) VALUES
  ('pension-room-2-bed-1', 'pension-room-2', 1, 'individual'),
  ('pension-room-2-bed-2', 'pension-room-2', 2, 'individual'),
  ('pension-room-2-bed-3', 'pension-room-2', 3, 'individual');

-- Habitación 3: 1 cama doble
INSERT INTO beds (id, room_id, number, type) VALUES
  ('pension-room-3-bed-1', 'pension-room-3', 1, 'doble');

-- Insert Albergue beds
-- Habitación 1: 4 literas (8 camas)
INSERT INTO beds (id, room_id, number, type) VALUES
  ('albergue-room-1-bed-1', 'albergue-room-1', 1, 'litera_superior'),
  ('albergue-room-1-bed-2', 'albergue-room-1', 2, 'litera_inferior'),
  ('albergue-room-1-bed-3', 'albergue-room-1', 3, 'litera_superior'),
  ('albergue-room-1-bed-4', 'albergue-room-1', 4, 'litera_inferior'),
  ('albergue-room-1-bed-5', 'albergue-room-1', 5, 'litera_superior'),
  ('albergue-room-1-bed-6', 'albergue-room-1', 6, 'litera_inferior'),
  ('albergue-room-1-bed-7', 'albergue-room-1', 7, 'litera_superior'),
  ('albergue-room-1-bed-8', 'albergue-room-1', 8, 'litera_inferior');

-- Habitación 2: 4 literas (8 camas)
INSERT INTO beds (id, room_id, number, type) VALUES
  ('albergue-room-2-bed-1', 'albergue-room-2', 1, 'litera_superior'),
  ('albergue-room-2-bed-2', 'albergue-room-2', 2, 'litera_inferior'),
  ('albergue-room-2-bed-3', 'albergue-room-2', 3, 'litera_superior'),
  ('albergue-room-2-bed-4', 'albergue-room-2', 4, 'litera_inferior'),
  ('albergue-room-2-bed-5', 'albergue-room-2', 5, 'litera_superior'),
  ('albergue-room-2-bed-6', 'albergue-room-2', 6, 'litera_inferior'),
  ('albergue-room-2-bed-7', 'albergue-room-2', 7, 'litera_superior'),
  ('albergue-room-2-bed-8', 'albergue-room-2', 8, 'litera_inferior');

-- Habitación 3: 4 literas (8 camas)
INSERT INTO beds (id, room_id, number, type) VALUES
  ('albergue-room-3-bed-1', 'albergue-room-3', 1, 'litera_superior'),
  ('albergue-room-3-bed-2', 'albergue-room-3', 2, 'litera_inferior'),
  ('albergue-room-3-bed-3', 'albergue-room-3', 3, 'litera_superior'),
  ('albergue-room-3-bed-4', 'albergue-room-3', 4, 'litera_inferior'),
  ('albergue-room-3-bed-5', 'albergue-room-3', 5, 'litera_superior'),
  ('albergue-room-3-bed-6', 'albergue-room-3', 6, 'litera_inferior'),
  ('albergue-room-3-bed-7', 'albergue-room-3', 7, 'litera_superior'),
  ('albergue-room-3-bed-8', 'albergue-room-3', 8, 'litera_inferior');