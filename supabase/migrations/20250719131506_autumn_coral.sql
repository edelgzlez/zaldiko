/*
  # Zaldiko Management Platform Database Schema

  1. New Tables
    - `rooms`
      - `id` (uuid, primary key)
      - `name` (text)
      - `type` (enum: pension, albergue)
      - `capacity` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `beds`
      - `id` (uuid, primary key)
      - `room_id` (uuid, foreign key to rooms)
      - `number` (integer)
      - `type` (enum: individual, doble, litera_superior, litera_inferior)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `guests`
      - `id` (uuid, primary key)
      - `name` (text)
      - `last_name` (text)
      - `id_number` (text, unique)
      - `phone` (text)
      - `email` (text)
      - `age` (integer)
      - `country` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `reservations`
      - `id` (uuid, primary key)
      - `bed_id` (uuid, foreign key to beds)
      - `guest_id` (uuid, foreign key to guests)
      - `check_in` (date)
      - `check_out` (date)
      - `status` (enum: confirmed, pending, cancelled)
      - `notes` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage all data
    - Add policies for API access (for future Retell AI and n8n integration)

  3. Indexes
    - Add indexes for frequently queried columns
    - Add unique constraints where needed
*/

-- Create custom types
CREATE TYPE room_type AS ENUM ('pension', 'albergue');
CREATE TYPE bed_type AS ENUM ('individual', 'doble', 'litera_superior', 'litera_inferior');
CREATE TYPE reservation_status AS ENUM ('confirmed', 'pending', 'cancelled');

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type room_type NOT NULL,
  capacity integer NOT NULL CHECK (capacity > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create beds table
CREATE TABLE IF NOT EXISTS beds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  number integer NOT NULL,
  type bed_type NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(room_id, number)
);

-- Create guests table
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

-- Create reservations table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_beds_room_id ON beds(room_id);
CREATE INDEX IF NOT EXISTS idx_reservations_bed_id ON reservations(bed_id);
CREATE INDEX IF NOT EXISTS idx_reservations_guest_id ON reservations(guest_id);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_guests_id_number ON guests(id_number);
CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email);

-- Enable Row Level Security
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (full access for management)
CREATE POLICY "Authenticated users can manage rooms"
  ON rooms
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage beds"
  ON beds
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage guests"
  ON guests
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage reservations"
  ON reservations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for service role (for API integrations like Retell AI and n8n)
CREATE POLICY "Service role can manage rooms"
  ON rooms
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage beds"
  ON beds
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage guests"
  ON guests
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage reservations"
  ON reservations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_beds_updated_at BEFORE UPDATE ON beds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON guests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();