require('dotenv').config();
const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../app');
const db = require('../db');

const stamp = Date.now();
const patient = { name: 'Pat', email: `pat${stamp}@test.com`, password: 'Password123' };
const other = { name: 'Other', email: `other${stamp}@test.com`, password: 'Password123' };
const doctorEmail = `doc${stamp}@test.com`;
const DATE = '2026-01-15';
let patientToken, doctorToken, patientId, otherId, registeredRole;

beforeAll(async () => {
  const p = await request(app).post('/auth/register').send(patient);
  patientToken = p.body.token;
  patientId = p.body.user.id;
  registeredRole = p.body.user.role;

  const o = await request(app).post('/auth/register').send(other);
  otherId = o.body.user.id;

  const hash = await bcrypt.hash('Password123', 10);
  const d = await db.query(
    "INSERT INTO users (name, email, password_hash, role) VALUES ('Doc', $1, $2, 'doctor') RETURNING id",
    [doctorEmail, hash]
  );
  await db.query('INSERT INTO doctor_patients (doctor_id, patient_id) VALUES ($1, $2)', [d.rows[0].id, patientId]);

  const login = await request(app).post('/auth/login').send({ email: doctorEmail, password: 'Password123' });
  doctorToken = login.body.token;

  await request(app)
    .post('/readings')
    .set('Authorization', `Bearer ${patientToken}`)
    .send({ date: DATE, slot: 'morning', value: 110 });
});

afterAll(async () => {
  await db.query('DELETE FROM users WHERE email = ANY($1)', [[patient.email, other.email, doctorEmail]]);
  await db.pool.end();
});

test('registering always creates a patient', () => {
  expect(registeredRole).toBe('patient');
});

test('a doctor sees only their assigned patients', async () => {
  const res = await request(app).get('/doctor/patients').set('Authorization', `Bearer ${doctorToken}`);
  expect(res.status).toBe(200);
  expect(res.body.patients).toHaveLength(1);
  expect(res.body.patients[0].id).toBe(patientId);
});

test("a doctor can read an assigned patient's reports", async () => {
  const res = await request(app)
    .get(`/doctor/patients/${patientId}/reports?date=${DATE}`)
    .set('Authorization', `Bearer ${doctorToken}`);
  expect(res.status).toBe(200);
  expect(res.body.daily.count).toBe(1);
  expect(res.body.daily.highest).toBe(110);
});

test('a doctor cannot read a patient who is not assigned to them', async () => {
  const res = await request(app)
    .get(`/doctor/patients/${otherId}/reports?date=${DATE}`)
    .set('Authorization', `Bearer ${doctorToken}`);
  expect(res.status).toBe(404);
});

test('a patient cannot use doctor routes', async () => {
  const res = await request(app).get('/doctor/patients').set('Authorization', `Bearer ${patientToken}`);
  expect(res.status).toBe(403);
});