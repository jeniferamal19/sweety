CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS readings (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reading_date DATE NOT NULL,
  slot TEXT NOT NULL CHECK (slot IN ('morning','after_breakfast','after_lunch','after_dinner')),
  value INT NOT NULL CHECK (value BETWEEN 40 AND 600),
  UNIQUE (user_id, reading_date, slot)
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient','doctor'));

CREATE TABLE IF NOT EXISTS doctor_patients (
  doctor_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  patient_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (doctor_id, patient_id)
);