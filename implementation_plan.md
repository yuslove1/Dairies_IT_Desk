# IT Desk — Implementation Plan

## What we're building

Two parallel tracks in one session:

1. **Asset Management** — a new feature added to the existing frontend
2. **`itDesk_api` — the backend** — a brand-new Node.js + Express + Prisma project in a sibling directory, written in an annotated, educational style so you can follow what every piece does and *why*

---

## Open Questions

> [!IMPORTANT]
> **Status enum alignment** — the frontend uses `"wip"` for in-progress tasks; the doc spec says `"in_progress"`. The backend Prisma schema will use **`"wip"`** to match the frontend. Confirm this is okay.

> [!IMPORTANT]
> **Asset categories** — for the IT department context I'm planning these types:
> `laptop | desktop | printer | ups | switch | server | monitor | phone | keyboard | other`
> Let me know if you want to add/remove any.

> [!NOTE]
> **Auth in production** — the doc says store JWT in `localStorage`. That's fine for a learning project and internal tool. We'll build it that way, but I'll add a comment in the code explaining why `httpOnly` cookies are the production-grade alternative.

---

## Track 1 — Asset Management (Frontend)

### What "Asset Management" means for IT

Track physical hardware owned by the department:
- Each asset has a **name**, **type**, **serial number**, **location**, **assigned department**, **status**, and optionally **purchase date** and **warranty expiry**
- Staff can **add**, **view**, **edit status**, and **retire** assets
- Manager sees the same list read-only

### Asset statuses
`active` | `in_repair` | `retired` | `unassigned`

---

### [MODIFY] [types/index.ts](file:///Users/mac2020airm1/Desktop/work/Dairies_IT_Desk/itDesk_frontend/types/index.ts)
Add new types:
```ts
export type AssetType = "laptop" | "desktop" | "printer" | "ups" | "switch" | "server" | "monitor" | "phone" | "keyboard" | "other";
export type AssetStatus = "active" | "in_repair" | "retired" | "unassigned";

export interface Asset {
  id: string;
  name: string;          // e.g. "HP LaserJet Pro M404dn"
  type: AssetType;
  serialNumber?: string;
  location: string;      // e.g. "Production Office"
  department: string;    // e.g. "HR", "Logistics"
  status: AssetStatus;
  purchaseDate?: string;
  warrantyExpiry?: string;
  notes?: string;
  addedAt: string;       // display string
}
```

---

### [NEW] lib/data/assets.ts
Mock asset data (12–15 realistic IT assets for UAC Dairies).

---

### [NEW] components/ui/AssetCard.tsx
Card component showing:
- Asset name + type icon (emoji: 💻 🖨 ⚡ etc.)
- Serial number (mono font, muted)
- Location + department badge
- Status pill (color-coded: active=green, in_repair=amber, retired=muted, unassigned=blue)
- Hover: green left-border accent (matches existing TaskCard style)

---

### [NEW] app/assets/layout.tsx
Thin wrapper matching other route layouts (same pattern as `tasks/layout.tsx`).

---

### [NEW] app/assets/page.tsx
Full assets page with:
- Header: "Asset Register" + asset count + `+ Add asset` button (staff only)
- **Stats strip**: 4 stat chips — Total / Active / In Repair / Unassigned (using existing `StatCard`)
- **Filter bar**: filter by `type` and `status` (client component, no API needed yet)
- **Asset grid**: responsive 1→2→3 col, maps over mock data using `AssetCard`
- **Add Asset form panel** (side panel, same layout as handover page form)

---

### [MODIFY] components/layout/Sidebar.tsx
Add **Asset Register** nav item to both `staffNav` and `managerNav`:
```ts
{ label: "Asset Register", icon: "◈", href: "/assets" }
```

---

## Track 2 — Backend (`itDesk_api`)

The backend lives at: **`/Users/mac2020airm1/Desktop/work/Dairies_IT_Desk/itDesk_api/`**

Every file will have block comments that explain:
- **What** the code does
- **Why** it's structured that way
- **What you'd change** in a production system

### Directory structure we'll create
```
itDesk_api/
  prisma/
    schema.prisma        ← all 6 models (User, Task, Log, Handover, Report, Asset)
  src/
    middleware/
      auth.js            ← verifies JWT, attaches req.user
      role.js            ← checks req.user.role against allowed roles
    routes/
      auth.js            ← /api/auth/* (login, register, /me)
      tasks.js           ← /api/tasks CRUD
      logs.js            ← /api/logs CRUD
      handover.js        ← /api/handover CRUD
      assets.js          ← /api/assets CRUD  ← new
      reports.js         ← /api/reports snapshot
    utils/
      generateToken.js   ← signs a JWT
      generateSnapshot.js← builds report JSON
  .env.example           ← template (safe to commit)
  index.js               ← Express app entry point
  package.json
  README.md              ← step-by-step setup guide for you to follow
```

---

### What each file teaches

| File | Concept you'll learn |
|---|---|
| `prisma/schema.prisma` | Data modelling, relations, enums, migrations |
| `src/middleware/auth.js` | How JWT verification works, `req` object manipulation |
| `src/middleware/role.js` | Role-based access control (RBAC) pattern |
| `src/routes/auth.js` | Password hashing with bcrypt, signing tokens |
| `src/routes/tasks.js` | REST CRUD pattern, query params, Prisma queries |
| `src/routes/assets.js` | Same CRUD pattern — repetition builds muscle memory |
| `src/routes/reports.js` | Snapshot/archiving pattern, nanoid, expiry logic |
| `index.js` | How Express is assembled, middleware chain order |
| `README.md` | How to run it, what every env variable does |

---

## Verification Plan

### Frontend
- `npm run dev` — confirm Assets page loads at `/assets`
- Confirm `AssetCard` renders, filter pills work
- Confirm sidebar shows "Asset Register" for both staff and manager roles

### Backend
```bash
cd itDesk_api
npm install
npx prisma migrate dev --name init
npm run dev
```
- `GET /api/health` → `{ ok: true }`
- `POST /api/auth/login` with test credentials → JWT returned
- `GET /api/assets` with Bearer token → 200 with empty array
- `GET /api/assets` without token → 401

---

## Build order

1. ✅ Types → 2. ✅ Mock data → 3. ✅ AssetCard → 4. ✅ Assets page → 5. ✅ Sidebar update
6. ✅ `itDesk_api` init → 7. ✅ Prisma schema → 8. ✅ index.js → 9. ✅ middleware → 10. ✅ routes (auth → tasks → logs → handover → assets → reports)
