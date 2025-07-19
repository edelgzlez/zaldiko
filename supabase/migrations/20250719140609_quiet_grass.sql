/*
  # Actualizar estructura de pensión

  1. Cambios en Pensión
    - Habitación 1: 3 camas individuales (sin cambios)
    - Habitación 2: 2 camas individuales (era 3, ahora 2)
    - Habitación 3: 2 camas individuales (era 1 doble, ahora 2 individuales)
    - Habitación 4: 1 cama doble (nueva habitación)

  2. Albergue
    - Sin cambios (mantiene 3 habitaciones de 8 camas cada una)

  3. Totales
    - Pensión: 8 camas (3+2+2+1)
    - Albergue: 24 camas (8+8+8)
    - Total: 32 camas
*/

-- Primero eliminamos todas las camas y habitaciones de pensión existentes
DELETE FROM beds WHERE room_id IN (
  SELECT id FROM rooms WHERE type = 'pension'
);

DELETE FROM rooms WHERE type = 'pension';

-- Creamos las nuevas habitaciones de pensión
INSERT INTO rooms (name, type, capacity) VALUES
  ('Pensión - Habitación 1', 'pension', 3),
  ('Pensión - Habitación 2', 'pension', 2),
  ('Pensión - Habitación 3', 'pension', 2),
  ('Pensión - Habitación 4', 'pension', 2);

-- Obtenemos los IDs de las habitaciones recién creadas
DO $$
DECLARE
  room1_id uuid;
  room2_id uuid;
  room3_id uuid;
  room4_id uuid;
BEGIN
  -- Obtener IDs de las habitaciones
  SELECT id INTO room1_id FROM rooms WHERE name = 'Pensión - Habitación 1';
  SELECT id INTO room2_id FROM rooms WHERE name = 'Pensión - Habitación 2';
  SELECT id INTO room3_id FROM rooms WHERE name = 'Pensión - Habitación 3';
  SELECT id INTO room4_id FROM rooms WHERE name = 'Pensión - Habitación 4';

  -- Habitación 1: 3 camas individuales
  INSERT INTO beds (room_id, number, type) VALUES
    (room1_id, 1, 'individual'),
    (room1_id, 2, 'individual'),
    (room1_id, 3, 'individual');

  -- Habitación 2: 2 camas individuales
  INSERT INTO beds (room_id, number, type) VALUES
    (room2_id, 1, 'individual'),
    (room2_id, 2, 'individual');

  -- Habitación 3: 2 camas individuales
  INSERT INTO beds (room_id, number, type) VALUES
    (room3_id, 1, 'individual'),
    (room3_id, 2, 'individual');

  -- Habitación 4: 1 cama doble
  INSERT INTO beds (room_id, number, type) VALUES
    (room4_id, 1, 'doble');
END $$;