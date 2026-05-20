# IT Desk API

REST backend for IT Desk — UAC Foods Dairies Plant.
Stack: **Node.js · Express · PostgreSQL · Prisma · JWT**

---

## Quick start (step by step)

### 1. Prerequisites
- Node.js 18+ installed (`node -v`)
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

To generate a strong JWT secret, run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Paste the output as `JWT_SECRET`.

### 4. Set up the database
```bash
# This reads prisma/schema.prisma and creates all the tables
npx prisma migrate dev --name init

# Open a visual DB browser (useful for checking data while you build)
npx prisma studio
```

### 5. Create your first user
Use Prisma Studio (step above) to manually insert a User row, or run:
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"it@uacfoods.com","password":"yourpassword","name":"IT Staff","role":"staff"}'
```

### 6. Start the dev server
```bash
npm run dev
```
The server starts at **http://localhost:4000**

Test it: `curl http://localhost:4000/api/health`
Expected: `{"ok":true,"message":"IT Desk API is running"}`

---

## API overview

All protected routes require: `Authorization: Bearer <token>`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | open | Create user |
| POST | `/api/auth/login` | open | Get JWT |
| GET | `/api/auth/me` | any | Current user profile |
| GET | `/api/tasks` | any | List tasks (`?status=todo\|wip\|done`) |
| POST | `/api/tasks` | staff/admin | Create task |
| PATCH | `/api/tasks/:id` | staff/admin | Update task |
| DELETE | `/api/tasks/:id` | staff/admin | Delete task |
| GET | `/api/logs` | any | List logs (`?date=YYYY-MM-DD`) |
| POST | `/api/logs` | staff/admin | Add log entry |
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
    schema.prisma        ← data models (edit here, then migrate)
  src/
    middleware/
      auth.js            ← verifies JWT, attaches req.user
      role.js            ← RBAC — checks req.user.role
    routes/
      auth.js            ← /api/auth/*
      tasks.js           ← /api/tasks/*
      logs.js            ← /api/logs/*
      handover.js        ← /api/handover/*
      assets.js          ← /api/assets/*
      reports.js         ← /api/reports/*
    utils/
      generateToken.js   ← creates signed JWTs
      generateSnapshot.js← builds the report JSON blob
  .env.example           ← copy to .env, fill in values
  index.js               ← Express app entry point
  package.json
```

Every file has comments explaining what it does and why. Start with `index.js`, then read `src/middleware/auth.js`, then any route file.

---

## Useful commands

```bash
npm run dev                          # start with hot-reload (nodemon)
npx prisma migrate dev --name init   # apply schema to database
npx prisma studio                    # visual database browser
npx prisma migrate reset             # reset DB (WARNING: deletes all data)
```
