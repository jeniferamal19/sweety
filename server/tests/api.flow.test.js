require('dotenv').config();
const request = require('supertest');
const app = require('../app');
const db = require('../db');

const stamp = Date.now();
const alice = { name: 'Alice', email: `alice${stamp}@test.com`, password: 'Password123' };
const bob = { name: 'Bob', email: `bob${stamp}@test.com`, password: 'Password123' };
const DATE = '2026-01-15'; // fixed past date
let tokenA, tokenB, readingId;

const addReading = (token, body) =>
  request(app).post('/readings').set('Authorization', `Bearer ${token}`).send(body);

beforeAll(async () => {
  tokenA = (await request(app).post('/auth/register').send(alice)).body.token;
  tokenB = (await request(app).post('/auth/register').send(bob)).body.token;
});

afterAll(async () => {
  await db.query('DELETE FROM users WHERE email = ANY($1)', [[alice.email, bob.email]]);
  await db.pool.end();
});

test('password is stored hashed, never as plain text', async () => {
  const r = await db.query('SELECT password_hash FROM users WHERE email = $1', [alice.email]);
  expect(r.rows[0].password_hash).not.toBe(alice.password);
  expect(r.rows[0].password_hash).toMatch(/^\$2[aby]\$/);
});

test('login works and a wrong password is rejected', async () => {
  const ok = await request(app).post('/auth/login').send({ email: alice.email, password: alice.password });
  expect(ok.status).toBe(200);
  const bad = await request(app).post('/auth/login').send({ email: alice.email, password: 'wrong' });
  expect(bad.status).toBe(401);
});

test('readings need a login', async () => {
  const res = await request(app).get('/readings');
  expect(res.status).toBe(401);
});

test('adds a reading, then rejects a duplicate slot', async () => {
  const first = await addReading(tokenA, { date: DATE, slot: 'morning', value: 110 });
  expect(first.status).toBe(201);
  readingId = first.body.reading.id;

  const dup = await addReading(tokenA, { date: DATE, slot: 'morning', value: 120 });
  expect(dup.body.error).toBe('You already have a Morning (fasting) reading for this date.');
});

test('rejects bad values and future dates', async () => {
  const low = await addReading(tokenA, { date: DATE, slot: 'after_lunch', value: 30 });
  expect(low.body.error).toBe('Value must be between 40 and 600 mg/dl.');
  const future = await addReading(tokenA, { date: '2099-01-01', slot: 'after_lunch', value: 100 });
  expect(future.body.error).toBe('Date cannot be in the future.');
});

test('a 5th reading on one day shows the 4-per-day message', async () => {
  for (const slot of ['after_breakfast', 'after_lunch', 'after_dinner']) {
    expect((await addReading(tokenA, { date: DATE, slot, value: 100 })).status).toBe(201);
  }
  const fifth = await addReading(tokenA, { date: DATE, slot: 'morning', value: 100 });
  expect(fifth.body.error).toBe('You can add only 4 readings per day.');
});

test("user B cannot see, edit or delete user A's readings", async () => {
  const list = await request(app).get('/readings').set('Authorization', `Bearer ${tokenB}`);
  expect(list.body.readings).toEqual([]);

  const del = await request(app).delete(`/readings/${readingId}`).set('Authorization', `Bearer ${tokenB}`);
  expect(del.status).toBe(404);

  const edit = await request(app).put(`/readings/${readingId}`)
    .set('Authorization', `Bearer ${tokenB}`).send({ date: DATE, slot: 'morning', value: 99 });
  expect(edit.status).toBe(404);
});
test('pagination returns pages and rejects bad values', async () => {
  const auth = { Authorization: `Bearer ${tokenA}` };

  const p1 = await request(app).get('/readings?page=1&limit=3').set(auth);
  expect(p1.status).toBe(200);
  expect(p1.body.readings).toHaveLength(3);
  expect(p1.body.total).toBe(4);
  expect(p1.body.totalPages).toBe(2);

  const p2 = await request(app).get('/readings?page=2&limit=3').set(auth);
  expect(p2.body.readings).toHaveLength(1);

  const bad = await request(app).get('/readings?limit=0').set(auth);
  expect(bad.status).toBe(400);
});