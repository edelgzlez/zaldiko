/*
  # Poblar habitaciones y camas de Zaldiko

  1. Habitaciones
    - Pensión: 3 habitaciones (1-3 camas individuales, 1 cama doble)
    - Albergue: 3 habitaciones de 8 camas cada una (4 literas por habitación)

  2. Camas
    - Pensión: Total 8 camas (7 individuales + 1 doble)
    - Albergue: Total 24 camas (12 literas = 24 camas)

  3. Estructura
    - Pensión Habitación 1: 3 camas individuales
    - Pensión Habitación 2: 3 camas individuales  
    - Pensión Habitación 3: 1 cama doble
    - Albergue Habitación 1: 8 camas (4 literas)
    - Albergue Habitación 2: 8 camas (4 literas)
    - Albergue Habitación 3: 8 camas (4 literas)
*/

-- Insertar habitaciones de la Pensión
INSERT INTO rooms (name, type, capacity) VALUES
  ('Pensión - Habitación 1', 'pension', 3),
  ('Pensión - Habitación 2', 'pension', 3),
  ('Pensión - Habitación 3', 'pension', 2);

-- Insertar habitaciones del Albergue
INSERT INTO rooms (name, type, capacity) VALUES
  ('Albergue - Habitación 1', 'albergue', 8),
  ('Albergue - Habitación 2', 'albergue', 8),
  ('Albergue - Habitación 3', 'albergue', 8);

-- Obtener IDs de las habitaciones para insertar camas
DO $$
DECLARE
  pension_room1_id uuid;
  pension_room2_id uuid;
  pension_room3_id uuid;
  albergue_room1_id uuid;
  albergue_room2_id uuid;
  albergue_room3_id uuid;
BEGIN
  -- Obtener IDs de habitaciones de pensión
  SELECT id INTO pension_room1_id FROM rooms WHERE name = 'Pensión - Habitación 1';
  SELECT id INTO pension_room2_id FROM rooms WHERE name = 'Pensión - Habitación 2';
  SELECT id INTO pension_room3_id FROM rooms WHERE name = 'Pensión - Habitación 3';
  
  -- Obtener IDs de habitaciones de albergue
  SELECT id INTO albergue_room1_id FROM rooms WHERE name = 'Albergue - Habitación 1';
  SELECT id INTO albergue_room2_id FROM rooms WHERE name = 'Albergue - Habitación 2';
  SELECT id INTO albergue_room3_id FROM rooms WHERE name = 'Albergue - Habitación 3';

  -- Insertar camas para Pensión - Habitación 1 (3 camas individuales)
  INSERT INTO beds (room_id, number, type) VALUES
    (pension_room1_id, 1, 'individual'),
    (pension_room1_id, 2, 'individual'),
    (pension_room1_id, 3, 'individual');

  -- Insertar camas para Pensión - Habitación 2 (3 camas individuales)
  INSERT INTO beds (room_id, number, type) VALUES
    (pension_room2_id, 1, 'individual'),
    (pension_room2_id, 2, 'individual'),
    (pension_room2_id, 3, 'individual');

  -- Insertar camas para Pensión - Habitación 3 (1 cama doble)
  INSERT INTO beds (room_id, number, type) VALUES
    (pension_room3_id, 1, 'doble');

  -- Insertar camas para Albergue - Habitación 1 (4 literas = 8 camas)
  INSERT INTO beds (room_id, number, type) VALUES
    (albergue_room1_id, 1, 'litera_inferior'),
    (albergue_room1_id, 2, 'litera_superior'),
    (albergue_room1_id, 3, 'litera_inferior'),
    (albergue_room1_id, 4, 'litera_superior'),
    (albergue_room1_id, 5, 'litera_inferior'),
    (albergue_room1_id, 6, 'litera_superior'),
    (albergue_room1_id, 7, 'litera_inferior'),
    (albergue_room1_id, 8, 'litera_superior');

  -- Insertar camas para Albergue - Habitación 2 (4 literas = 8 camas)
  INSERT INTO beds (room_id, number, type) VALUES
    (albergue_room2_id, 1, 'litera_inferior'),
    (albergue_room2_id, 2, 'litera_superior'),
    (albergue_room2_id, 3, 'litera_inferior'),
    (albergue_room2_id, 4, 'litera_superior'),
    (albergue_room2_id, 5, 'litera_inferior'),
    (albergue_room2_id, 6, 'litera_superior'),
    (albergue_room2_id, 7, 'litera_inferior'),
    (albergue_room2_id, 8, 'litera_superior');

  -- Insertar camas para Albergue - Habitación 3 (4 literas = 8 camas)
  INSERT INTO beds (room_id, number, type) VALUES
    (albergue_room3_id, 1, 'litera_inferior'),
    (albergue_room3_id, 2, 'litera_superior'),
    (albergue_room3_id, 3, 'litera_inferior'),
    (albergue_room3_id, 4, 'litera_superior'),
    (albergue_room3_id, 5, 'litera_inferior'),
    (albergue_room3_id, 6, 'litera_superior'),
    (albergue_room3_id, 7, 'litera_inferior'),
    (albergue_room3_id, 8, 'litera_superior');

END $$;