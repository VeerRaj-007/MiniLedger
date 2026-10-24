# MiniLedger

A small app to track money lent to friends — who owes you, how much, and what's overdue.

## Stack
- **Backend:** Node.js, TypeScript, Express, Prisma, PostgreSQL, JWT auth
- **App:** React Native (Expo), React Navigation, AsyncStorage

## Project structure
```
MiniLedger/
  backend/   -> API server
  app/       -> Expo React Native app
```

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
- `DATABASE_URL` — point this at a Postgres instance. Easiest options:
  - Local Postgres: `postgresql://user:password@localhost:5432/miniledger`
  - Free hosted Postgres (no local install needed): [Neon](https://neon.tech) or [Supabase](https://supabase.com) — create a project, copy the connection string
- `JWT_SECRET` — any random string

Run the migration (creates the tables):
```bash
npx prisma migrate dev --name init
```

Start the server:
```bash
npm run dev
```
Server runs on `http://localhost:4000`. When you request an OTP, **watch this terminal** — the code is printed there instead of being sent by SMS.

## 2. App setup

```bash
cd app
npm install
```

Open `app/src/api/client.ts` and set `API_URL` to your computer's **LAN IP** (not `localhost` — your phone is a separate device on the network):
```ts
export const API_URL = "http://192.168.X.X:4000";
```
Find your IP with `ipconfig` (Windows) or `ifconfig` / `ipconfig getifaddr en0` (Mac). Your phone and laptop must be on the same Wi-Fi network.

Start the app:
```bash
npx expo start
```
Scan the QR code with the **Expo Go** app (iOS/Android) to run it on your phone.

## How it works
- **Login:** enter a phone number -> OTP is generated and printed in the backend terminal -> enter it in the app -> you get a JWT that's stored locally and sent on every request after.
- **Entries:** add a friend's name, amount, and due date. An entry is "overdue" if it's unpaid and past its due date — computed on the fly, not stored.
- **Summary card:** total lent, total repaid, and total overdue, recalculated from your current entries every time you open or refresh the list.
- **Receipts (bonus):** tap the "+ receipt" square on an entry to take a photo or pick one from your library. It uploads to the backend and is served back from `/uploads`.

## Tests

```bash
cd backend
npm test
```

19 tests across three files:
- `loanCalculations.test.ts` — unit tests for the overdue check and the lent/repaid/overdue summary math (pure functions, no DB needed)
- `validation.test.ts` — unit tests for the Zod request-validation schemas (phone, OTP, loan payload)
- `routes.test.ts` — supertest requests through the real Express app covering the auth guard (401 on missing/invalid token) and `/auth/send-otp` input validation

These don't require a live Postgres connection — they deliberately only exercise code paths that stop before touching Prisma (auth middleware, validation). The DB-touching logic (the actual Prisma queries) is intentionally thin wrappers around the tested pure functions above.

## API reference
| Method | Route | Description |
|---|---|---|
| POST | `/auth/send-otp` | `{ phone }` -> generates OTP, logs it to console |
| POST | `/auth/verify-otp` | `{ phone, otp }` -> `{ token }` |
| POST | `/loans` | `{ friendName, amount, dueDate }` -> create entry (auth required) |
| GET | `/loans` | list entries, each flagged `overdue` (auth required) |
| PATCH | `/loans/:id/repay` | mark an entry repaid (auth required) |
| GET | `/summary` | `{ totalLent, totalRepaid, overdueAmount }` (auth required) |

## Notes / known limitations
- OTP is mocked (printed to server log) per the assignment spec — no real SMS provider is wired up.
- Receipts are stored on local disk under `backend/uploads/` and served via `express.static`. Fine for this assignment's scope; a production deployment would use S3/GCS instead since local disk doesn't survive most redeploys.
- Due date input in the app is a plain text field (`YYYY-MM-DD`) rather than a native date picker, to avoid an extra native dependency.
- If you've already run `prisma migrate dev` before pulling the `receiptUrl` field, run `npx prisma migrate dev --name add-receipt-url` again to pick up the schema change.
