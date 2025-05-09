-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  nid_hash TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create verifications table
CREATE TABLE IF NOT EXISTS verifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  nid_number TEXT NOT NULL,
  passport_number TEXT,
  date_of_birth TEXT NOT NULL,
  address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  wallet_id INTEGER NOT NULL REFERENCES wallets(id),
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  payment_id TEXT,
  payment_method TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create trains table
CREATE TABLE IF NOT EXISTS trains (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  train_number TEXT NOT NULL UNIQUE,
  from_station TEXT NOT NULL,
  to_station TEXT NOT NULL,
  departure_time TEXT NOT NULL,
  arrival_time TEXT NOT NULL,
  duration TEXT NOT NULL,
  type TEXT NOT NULL,
  total_seats INTEGER NOT NULL,
  available_seats INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
);

-- Create schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  train_id INTEGER NOT NULL REFERENCES trains(id),
  journey_date TEXT NOT NULL,
  available_seats INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  schedule_id INTEGER NOT NULL REFERENCES schedules(id),
  seat_number TEXT NOT NULL,
  payment_id TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  ticket_hash TEXT NOT NULL,
  qr_code TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 150,
  issued_at TIMESTAMP NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'booked',
  metadata JSONB
);

-- Create ticket_verifications table
CREATE TABLE IF NOT EXISTS ticket_verifications (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES tickets(id),
  verified_by INTEGER NOT NULL,
  verified_at TIMESTAMP NOT NULL DEFAULT NOW(),
  location TEXT,
  status TEXT NOT NULL
);

-- Create email_verifications table
CREATE TABLE IF NOT EXISTS email_verifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  email TEXT NOT NULL,
  verification_code TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create session table
CREATE TABLE IF NOT EXISTS session (
  sid VARCHAR(255) PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP NOT NULL
); 