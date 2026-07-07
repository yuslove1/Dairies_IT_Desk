# IT Desk API

REST + realtime backend for IT Desk — UAC Foods Dairies Plant.
Stack: **Node.js · Express · PostgreSQL · Prisma · express-session · socket.io**

> The frontend for this project lives in a separate repository: [itDesk-frontend](https://github.com/yuslove1/itDesk-frontend) — that repo's README has the full project overview, architecture, and testing guide.

---

## Quick start (step by step)

### 1. Prerequisites
- Node.js 20+ installed (`node -v`)
- A PostgreSQL database (see "Database options" below)

### 2. Install dependencies
```bash
cd itDesk_api
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env
```
Open `.env` and fill in your values. The file has comments explaining each one.

To generate a strong session secret, run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Paste the output as `SESSION_SECRET`.

### 4. Set up the database
Migrations already exist in `prisma/migrations/` (this isn't a brand-new schema) — just apply them:
```bash
npx prisma migrate dev

# Open a visual DB browser (useful for checking data while you build)
npx prisma studio
```

### 5. Create your first user
Fastest path — seed an already-verified test account (skips the OTP step entirely):
```bash
node create_preapproved_users.js
```
Or register through the API and complete the OTP flow like a real user would:
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"it@uacfoods.com","password":"yourpassword","name":"IT Staff","role":"staff"}'
```
In development, the 6-digit OTP is printed straight to this server's console (see `src/routes/auth.js`) — no real email delivery needed to test locally.

### 6. Start the dev server
```bash
npm run dev
```
The server starts at **http://localhost:4000**

Test it: `curl http://localhost:4000/api/health`
Expected: `{"ok":true,"message":"IT Desk API is running"}`

---

## API overview

Auth is **session-based**, not token-based: logging in sets an `httpOnly` cookie (`it_desk_sid`) automatically via `Set-Cookie` — there's no token to copy into an `Authorization` header. Any client calling protected routes needs to send that cookie back, which means enabling credentials on every request:
- axios: `withCredentials: true`
- fetch: `credentials: "include"`
- curl: `-b cookies.txt` (reusing a cookie jar from a prior `-c cookies.txt` login)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | open | Create user, sends OTP email |
| POST | `/api/auth/verify-otp` | open | Verify OTP, starts a session |
| POST | `/api/auth/resend-otp` | open | Resend a fresh OTP |
| POST | `/api/auth/login` | open | Starts a session (sets the cookie) |
| POST | `/api/auth/logout` | any | Destroys the session server-side |
| GET | `/api/auth/me` | any | Current user profile |
| GET | `/api/tasks` | any | List tasks (`?status=todo\|wip\|done`) |
| POST | `/api/tasks` | staff/admin | Create task |
| PATCH | `/api/tasks/:id` | staff/admin | Update task |
| DELETE | `/api/tasks/:id` | staff/admin | Delete task |
| GET | `/api/logs` | any | List logs (`?date=YYYY-MM-DD`) |
| POST | `/api/logs` | staff/admin | Add log entry |
| PATCH | `/api/logs/:id` | manager/admin | Edit log entry |
| DELETE | `/api/logs/:id` | staff/admin | Delete log entry |
| GET | `/api/handover` | any | List notes (`?all=true` includes archived) |
| POST | `/api/handover` | staff/admin | Create note |
| PATCH | `/api/handover/:id` | staff/admin | Update / archive note |
| DELETE | `/api/handover/:id` | staff/admin | Hard delete note |
| GET | `/api/assets` | any | List assets (`?status=` `?type=` `?department=`) |
| GET | `/api/assets/:id` | any | Single asset |
| POST | `/api/assets` | staff/admin | Register asset |
| PATCH | `/api/assets/:id` | staff/admin | Update asset |
| DELETE | `/api/assets/:id` | staff/admin | Delete asset |
| POST | `/api/reports` | staff/admin | Generate snapshot → returns `{ url }` |
| GET | `/api/reports/:token` | **public** | Fetch snapshot (no auth needed) |

**Realtime**: a `socket.io` connection at the same host/port pushes live updates as `task:created` / `task:updated` / `task:deleted` / `log:created` / `log:updated` / `log:deleted`. A socket can only connect while carrying a valid session cookie — it's authenticated the same way regular requests are, not a separate login step.

---

## Database options

**Option A — Local (for development)**
Install PostgreSQL locally and use:
```
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/itdesk"
```

**Option B — Railway (recommended for deployment)**
1. Create account at [railway.app](https://railway.app)
2. New project → Add PostgreSQL
3. Copy the `DATABASE_URL` from the Variables tab
4. Deploy this repo as a second service in the same project

**Option C — Render**
1. Create account at [render.com](https://render.com)
2. New → PostgreSQL → copy the external connection string

---

## Folder structure

```
itDesk_api/
  prisma/
    schema.prisma        ← data models, including the Session table (edit here, then migrate)
    migrations/           ← already contains the full migration history — see step 4 above
  src/
    middleware/
      auth.js            ← verifies the session (via req.session), attaches req.user
      role.js            ← RBAC — checks req.user.role
    routes/
      auth.js            ← /api/auth/* — register/verify/login/logout/me
      tasks.js           ← /api/tasks/* — also emits task:* socket events
      logs.js            ← /api/logs/* — also emits log:* socket events
      handover.js        ← /api/handover/*
      assets.js          ← /api/assets/*
      reports.js         ← /api/reports/*
      users.js           ← /api/users — staff directory for the manager's assignee dropdown
    utils/
      sendOtp.js         ← emails the 6-digit OTP
      generateSnapshot.js← builds the report JSON blob
  create_preapproved_users.js  ← seeds already-verified test accounts (see step 5 above)
  .env.example           ← copy to .env, fill in values
  index.js               ← Express app entry point — sessions, CORS, and socket.io are all wired up here
  package.json
```

Every file has comments explaining what it does and why. Start with `index.js`, then read `src/middleware/auth.js`, then any route file.

---

## Useful commands

```bash
npm run dev                # start with hot-reload (nodemon)
npx prisma migrate dev     # apply any pending migrations to your database
npx prisma studio          # visual database browser
npx prisma migrate reset   # reset DB (WARNING: deletes all data)
```
