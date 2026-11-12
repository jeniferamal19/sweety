<!--
HOW TO USE THIS FILE (these comments are invisible on GitHub):
1. Each bonus has its own block between "BONUS START" and "BONUS END" comments.
2. When a bonus WORKS, tick its box in the "Bonus tasks" table (change [ ] to [x]).
3. If a bonus is NOT finished by the time you send the email, delete its whole block,
   untick it in the table, and list it under "Bonus tasks not attempted" in the Notes.
4. Never leave a block in for something that does not work.
-->

# Sweety – Blood Glucose Tracker

Sweety is a small web app where a diabetes patient records up to 4 blood glucose readings a day (in mg/dl) and views daily, month-to-date and previous-month reports.

**Stack:** Node.js + Express API, PostgreSQL, React (Vite).

## Features

- Sign up and log in (passwords hashed with bcrypt, sessions with JWT)
- Each user sees only their own readings
- Add, view, edit and delete readings (date, time slot, value in mg/dl)
- Four slots per day: Morning (fasting), After breakfast, After lunch, After dinner
- Validation with clear messages in the UI:
  - Value is required
  - Value must be a whole number between 40 and 600
  - Only one reading per slot per day
  - Maximum 4 readings per day
  - Date cannot be in the future
- Reports (highest, lowest, average rounded to 1 decimal, and number of readings):
  - Daily (the selected date, with each reading and its slot)
  - Month-to-date (1st of the month up to the selected date)
  - Previous month (the whole calendar month before the selected date)
  - A friendly empty state when there are no readings

## Bonus tasks

| Done | Bonus | Where to read more |
|---|---|---|
| [ ] | Pagination on `GET /readings` | [Pagination](#bonus-pagination) |
| [ ] | Chart of readings over the month | [Charts](#bonus-charts) |
| [ ] | Docker (`docker-compose.yml`) | [Docker](#bonus-docker) |
| [ ] | Frontend tests (React Testing Library) | [Frontend tests](#bonus-frontend-tests) |
| [ ] | Redis caching of reports | [Redis caching](#bonus-redis-caching) |
| [ ] | Background job with BullMQ | [BullMQ job](#bonus-bullmq-reminder-job) |
| [ ] | Doctor role | [Doctor role](#bonus-doctor-role) |

## Project structure

```
sweety/
  docker-compose.yml  (bonus: PostgreSQL, Redis and the app)
  server/             Express API
    controllers/      request handlers (auth, readings, reports)
    routes/           URL routes
    middleware/       JWT auth check
    services/         validation and date-range logic (with unit tests)
    db/               database connection, schema.sql, seed.js
    tests/            API flow test (Supertest)
  client/             React app (Vite)
    src/pages/        login/register page and dashboard
    src/components/   reading form, readings list, reports panel
```

## Requirements

- Node.js 18 or newer
- PostgreSQL 14 or newer
- (Bonus only) Docker, for the Docker, Redis and BullMQ bonuses

## 1. Install

From the project root:

```bash
cd server
npm install
cd ../client
npm install
```

## 2. Environment variables

Copy the example files and fill in your own values (no real secrets are committed).

**Server** (`server/.env`):

| Variable | Meaning | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgres://user:password@localhost:5432/sweety` |
| `JWT_SECRET` | Long random text used to sign login tokens | `change_me` |
| `PORT` | Port for the API | `5000` |
| `REDIS_URL` | (Bonus) Redis connection. Leave empty to run without Redis | `redis://localhost:6379` |

**Client** (`client/.env`):

| Variable | Meaning | Example |
|---|---|---|
| `VITE_API_URL` | URL of the API | `http://localhost:5000` |

Windows (PowerShell):

```powershell
copy server\.env.example server\.env
copy client\.env.example client\.env
```

macOS / Linux:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

To generate a good `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 3. Set up the database

Create the database, then create the tables from the schema file:

```bash
psql -U postgres -c "CREATE DATABASE sweety;"
psql -U postgres -d sweety -f server/db/schema.sql
```

Use the same user, password and database name in `DATABASE_URL`. (If you use the Docker bonus, the database and tables are created for you. See [Docker](#bonus-docker).)

## 4. Seed demo data

```bash
cd server
npm run seed
```

This creates a demo user with about six weeks of sample readings, so all three reports have data:

- Email: `demo@example.com`
- Password: `password123`

Running it again resets the demo user's readings (no duplicates).

## 5. Run the server

```bash
cd server
npm run dev
```

The API runs at `http://localhost:5000`. Check `http://localhost:5000/health`.

## 6. Run the client

In a second terminal:

```bash
cd client
npm run dev
```

Open `http://localhost:5173`.

## 7. Run the tests

```bash
cd server
npm test
```

What is tested:

- **Validation rules:** the value, slot and date checks and their exact error messages
- **Report date ranges:** month-to-date and previous month, including January and leap years
- **API flow (Supertest):** passwords are stored hashed, wrong login is rejected, readings need a login, duplicate slot and 4-per-day errors, and user B cannot see, edit or delete user A's readings

The API flow test uses the real database from `DATABASE_URL`, so PostgreSQL must be running and the schema must exist. It creates two throwaway users and deletes them when it finishes.

## API overview

| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/register` | Create an account |
| POST | `/auth/login` | Log in, returns a token |
| GET | `/auth/me` | Current user |
| GET | `/readings` | List my readings (optional `?date=YYYY-MM-DD`) |
| POST | `/readings` | Add a reading |
| PUT | `/readings/:id` | Edit a reading |
| DELETE | `/readings/:id` | Delete a reading |
| GET | `/reports?date=YYYY-MM-DD` | Daily, month-to-date and previous-month reports |

All `/readings` and `/reports` routes need the header `Authorization: Bearer <token>`.

## Screenshots

<!-- Add your screenshots or a link to your screen recording here. -->

---

# Bonus task details

<!-- BONUS START: pagination -->
## Bonus: Pagination

`GET /readings?page=1&limit=20` returns one page of readings, newest first.

- `page` starts at 1 (default 1). `limit` is 1 to 100 (default 20). Invalid values return a 400 with a clear message.
- The response also includes `page`, `limit`, `total` and `totalPages`, so the client can draw "Previous / Next" buttons.
- The readings list in the UI uses these buttons. The `?date=` filter still works together with pagination.

```json
{ "readings": [ ... ], "page": 1, "limit": 20, "total": 87, "totalPages": 5 }
```
<!-- BONUS END: pagination -->

<!-- BONUS START: charts -->
## Bonus: Charts

The dashboard shows a line chart (Recharts) of the selected month's readings. The x-axis is the day of the month and the y-axis is mg/dl. Each time slot is its own line, so patterns such as high fasting values are easy to spot. A month with no readings shows the same friendly empty state as the reports.
<!-- BONUS END: charts -->

<!-- BONUS START: docker -->
## Bonus: Docker

`docker-compose.yml` starts everything the app needs with one command.

Start only the infrastructure (PostgreSQL and Redis), then run the server and client normally:

```bash
docker compose up -d db redis
```

The `db` container creates the `sweety` database and loads `server/db/schema.sql` on its first start. Use this in `server/.env`:

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/sweety
REDIS_URL=redis://localhost:6379
```

Or start everything, including the API, in containers:

```bash
docker compose up --build
```

Stop with `docker compose down`. Add `-v` to also delete the database volume and start from scratch.
<!-- BONUS END: docker -->

<!-- BONUS START: frontend-tests -->
## Bonus: Frontend tests

The reading form is tested with Vitest and React Testing Library:

```bash
cd client
npm test
```

The tests check that the form renders its fields, that the server's error messages (for example "Please enter a glucose value.") are shown on screen, and that a successful save clears the field and tells the page to refresh.
<!-- BONUS END: frontend-tests -->

<!-- BONUS START: redis -->
## Bonus: Redis caching

Report results are cached in Redis, so repeated requests for the same date skip the database.

- Cache key: `reports:<userId>:<date>`, with a one-hour expiry as a safety net.
- Whenever a reading is added, edited or deleted, that user's cached reports are deleted, so they never show stale numbers.
- Redis is optional. If `REDIS_URL` is empty or Redis is down, the app logs a warning and reads from PostgreSQL as usual.
<!-- BONUS END: redis -->

<!-- BONUS START: bullmq -->
## Bonus: BullMQ reminder job

A background worker logs a daily reminder for every patient who has fewer than 4 readings today. It needs Redis (see [Docker](#bonus-docker)).

Run the worker in its own terminal:

```bash
cd server
npm run worker
```

- The job is scheduled every day at 20:00 server time (a repeatable BullMQ job).
- It writes one log line per user, for example `Reminder: Demo User (demo@example.com) has 2 of 4 readings today.` Sending real emails or push messages is out of scope.
- To test it right away without waiting for 20:00, run `npm run worker -- --now`.
<!-- BONUS END: bullmq -->

<!-- BONUS START: doctor -->
## Bonus: Doctor role

Users now have a role: `patient` (default) or `doctor`. A doctor can view the reports of the patients assigned to them, and nothing else.

- Assignments live in a `doctor_patients` table. `npm run seed` creates a demo doctor and assigns the demo patient to them:
  - Email: `doctor@example.com`
  - Password: `password123`
- Registration always creates a patient. Doctor accounts are created by the seed script only.
- A doctor sees a patient list instead of the reading form. Choosing a patient shows that patient's reports for the selected date (read-only).

| Method | Path | Purpose |
|---|---|---|
| GET | `/doctor/patients` | Patients assigned to the logged-in doctor |
| GET | `/doctor/patients/:id/reports?date=YYYY-MM-DD` | Reports for one assigned patient |

A patient who is not assigned to the doctor gets a 404, and a patient account calling these routes gets a 403.
<!-- BONUS END: doctor -->

---

## Notes

### Assumptions

- "Today" and "future" are judged in the server's local time (India). Dates are handled as plain `YYYY-MM-DD` text, so timezones cannot shift a reading to another day.
- "Previous month" means the whole calendar month before the selected date (for 15 Oct 2026 it is 1 Sep to 30 Sep 2026). Month-to-date includes the selected date.
- The value must be digits only, for example `110`. Decimals, negative numbers and forms like `1e2` are rejected.
- The 4-per-day check runs before the duplicate-slot check, so a fifth reading on a full day always shows the 4-per-day message.
- Both the "one reading per slot per day" rule and the value range are enforced in the API and again in the database (unique constraint and check constraint), so bad data cannot get in even if a request arrives twice at once.
- Passwords need at least 8 characters. Emails are stored in lowercase.
- The login token (JWT, 7 days) is kept in the browser's localStorage. This is simple, but not the most secure option.
- A reading that belongs to another user is reported as "not found" (404), not "forbidden", so its existence is not revealed.

### What I would improve with more time

- Store the token in an httpOnly cookie instead of localStorage, and add refresh tokens.
- Rate-limit the login and register routes.
- Use a separate test database, and add a migration tool instead of a single `schema.sql`.
- Improve the UI (accessibility, mobile layout, per-user timezone).
- Let doctors request or accept patient assignments in the app, instead of assigning them in the seed script.
- Send the daily reminders as real emails or push notifications.
