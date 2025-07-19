/*
  # Inicialización completa de Zaldiko - Pensión y Albergue

  1. Crear funciones auxiliares
  2. Crear tipos personalizados (enums)
  3. Crear tablas principales
  4. Configurar seguridad (RLS)
  5. Poblar datos iniciales
  6. Crear índices y optimizaciones
*/

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear tipos personalizados
DO $$ BEGIN
  CREATE TYPE room_type AS ENUM ('pension', 'albergue');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE bed_type AS ENUM ('individual', 'doble', 'litera_superior', 'litera_inferior');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE reservation_status AS ENUM ('confirmed', 'pending', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Crear tabla de habitaciones
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type room_type NOT NULL,
  capacity integer NOT NULL CHECK (capacity > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla de camas
CREATE TABLE IF NOT EXISTS beds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  number integer NOT NULL,
  type bed_type NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(room_id, number)
);

-- Crear tabla de huéspedes
CREATE TABLE IF NOT EXISTS guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  last_name text NOT NULL,
  id_number text UNIQUE NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  age integer NOT NULL CHECK (age > 0 AND age <= 120),
  country text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla de reservas
CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bed_id uuid NOT NULL REFERENCES beds(id) ON DELETE CASCADE,
  guest_id uuid NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  check_in date NOT NULL,
  check_out date NOT NULL,
  status reservation_status NOT NULL DEFAULT 'confirmed',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (check_out > check_in)
);

-- Crear triggers para updated_at
DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms;
CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_beds_updated_at ON beds;
CREATE TRIGGER update_beds_updated_at
  BEFORE UPDATE ON beds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_guests_updated_at ON guests;
CREATE TRIGGER update_guests_updated_at
  BEFORE UPDATE ON guests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reservations_updated_at ON reservations;
CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS en todas las tablas
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios autenticados (gestión completa)
CREATE POLICY "Authenticated users can manage rooms" ON rooms
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage rooms" ON rooms
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage beds" ON beds
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage beds" ON beds
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage guests" ON guests
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage guests" ON guests
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage reservations" ON reservations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage reservations" ON reservations
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Crear índices para optimización
CREATE INDEX IF NOT EXISTS idx_beds_room_id ON beds(room_id);
CREATE INDEX IF NOT EXISTS idx_guests_id_number ON guests(id_number);
CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email);
CREATE INDEX IF NOT EXISTS idx_reservations_bed_id ON reservations(bed_id);
CREATE INDEX IF NOT EXISTS idx_reservations_guest_id ON reservations(guest_id);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);

-- POBLAR DATOS INICIALES DE ZALDIKO

-- Limpiar datos existentes (solo si existen)
DELETE FROM reservations;
DELETE FROM beds;
DELETE FROM rooms;

-- Insertar habitaciones de la Pensión
INSERT INTO rooms (id, name, type, capacity) VALUES
  ('pension-room-1', 'Pensión - Habitación 1', 'pension', 3),
  ('pension-room-2', 'Pensión - Habitación 2', 'pension', 3),
  ('pension-room-3', 'Pensión - Habitación 3', 'pension', 2);

-- Insertar habitaciones del Albergue
INSERT INTO rooms (id, name, type, capacity) VALUES
  ('albergue-room-1', 'Albergue - Habitación 1', 'albergue', 8),
  ('albergue-room-2', 'Albergue - Habitación 2', 'albergue', 8),
  ('albergue-room-3', 'Albergue - Habitación 3', 'albergue', 8);

-- Insertar camas de la Pensión
-- Habitación 1: 3 camas individuales
INSERT INTO beds (room_id, number, type) VALUES
  ('pension-room-1', 1, 'individual'),
  ('pension-room-1', 2, 'individual'),
  ('pension-room-1', 3, 'individual');

-- Habitación 2: 3 camas individuales
INSERT INTO beds (room_id, number, type) VALUES
  ('pension-room-2', 1, 'individual'),
  ('pension-room-2', 2, 'individual'),
  ('pension-room-2', 3, 'individual');

-- Habitación 3: 1 cama doble
INSERT INTO beds (room_id, number, type) VALUES
  ('pension-room-3', 1, 'doble');

-- Insertar camas del Albergue
-- Habitación 1: 8 camas (4 literas)
INSERT INTO beds (room_id, number, type) VALUES
  ('albergue-room-1', 1, 'litera_inferior'),
  ('albergue-room-1', 2, 'litera_superior'),
  ('albergue-room-1', 3, 'litera_inferior'),
  ('albergue-room-1', 4, 'litera_superior'),
  ('albergue-room-1', 5, 'litera_inferior'),
  ('albergue-room-1', 6, 'litera_superior'),
  ('albergue-room-1', 7, 'litera_inferior'),
  ('albergue-room-1', 8, 'litera_superior');

-- Habitación 2: 8 camas (4 literas)
INSERT INTO beds (room_id, number, type) VALUES
  ('albergue-room-2', 1, 'litera_inferior'),
  ('albergue-room-2', 2, 'litera_superior'),
  ('albergue-room-2', 3, 'litera_inferior'),
  ('albergue-room-2', 4, 'litera_superior'),
  ('albergue-room-2', 5, 'litera_inferior'),
  ('albergue-room-2', 6, 'litera_superior'),
  ('albergue-room-2', 7, 'litera_inferior'),
  ('albergue-room-2', 8, 'litera_superior');

-- Habitación 3: 8 camas (4 literas)
INSERT INTO beds (room_id, number, type) VALUES
  ('albergue-room-3', 1, 'litera_inferior'),
  ('albergue-room-3', 2, 'litera_superior'),
  ('albergue-room-3', 3, 'litera_inferior'),
  ('albergue-room-3', 4, 'litera_superior'),
  ('albergue-room-3', 5, 'litera_inferior'),
  ('albergue-room-3', 6, 'litera_superior'),
  ('albergue-room-3', 7, 'litera_inferior'),
  ('albergue-room-3', 8, 'litera_superior');