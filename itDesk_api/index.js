// ─────────────────────────────────────────────────────────────────────────────
// index.js — Express application entry point
//
// WHAT IS EXPRESS?
// Express is a minimal web framework for Node.js. It lets you define "routes"
// (URL patterns) and what should happen when a request hits each one.
//
// HOW THIS FILE WORKS:
// 1. Load environment variables from .env
// 2. Create the Express app
// 3. Attach middleware (functions that process every request before it hits your routes)
// 4. Mount route files (each file handles a group of related endpoints)
// 5. Wrap the app in a raw HTTP server and attach socket.io to it
// 6. Start listening on a port
// ─────────────────────────────────────────────────────────────────────────────

// dotenv reads your .env file and adds the variables to process.env
// e.g. process.env.PORT, process.env.SESSION_SECRET
require("dotenv").config();

const express = require("express");
const http    = require("http");
const cors    = require("cors");
const session = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient }       = require("@prisma/client");
const { Server }             = require("socket.io");

// Import all route files
const authRoutes     = require("./src/routes/auth");
const taskRoutes     = require("./src/routes/tasks");
const logRoutes      = require("./src/routes/logs");
const handoverRoutes = require("./src/routes/handover");
const assetRoutes    = require("./src/routes/assets");
const reportRoutes   = require("./src/routes/reports");
const userRoutes     = require("./src/routes/users");

// ── Create the Express app ────────────────────────────────────────────────────
const app    = express();
const prisma = new PrismaClient();

// Render (and most PaaS hosts) sit their own reverse proxy in front of your app
// and terminate HTTPS there, forwarding to your app over plain HTTP internally.
// Without this, Express would think every request is insecure and refuse to
// set `Secure` cookies even though the browser really did connect over HTTPS.
app.set("trust proxy", 1);

// ── Middleware ────────────────────────────────────────────────────────────────
// WHAT IS MIDDLEWARE?
// Middleware is a function that runs on EVERY request before it reaches your route.
// Think of it as a series of checkpoints a request passes through.

// cors() — Cross-Origin Resource Sharing
// Browsers block requests from one domain to another by default.
// We allow the configured CLIENT_URL plus common dev ports (3000 & 3001)
// because Next.js picks the next free port automatically.
//
// credentials: true is required for session cookies to travel cross-origin —
// without it the browser won't send (or accept) the Set-Cookie header at all.
// Note this only works alongside a specific origin list, never "*".
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://localhost:3001",
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// express.json() — parses incoming request bodies as JSON
// Without this, req.body would be undefined in your route handlers.
app.use(express.json());

// ── Sessions ──────────────────────────────────────────────────────────────────
// WHY express-session + a DB-backed store?
// express-session handles the cookie and req.session plumbing, but by default
// it keeps session data in memory — wiped on every restart, and broken the
// moment you run more than one server instance. The Prisma store persists
// sessions in the same Postgres database as everything else, so a session
// survives restarts and would work fine even with multiple server instances.
//
// This middleware is defined separately (not inline in app.use()) because
// socket.io needs to reuse the exact same instance further down this file —
// that's what lets a WebSocket connection see the same req.session as an
// HTTP request from the same logged-in browser.
const sessionMiddleware = session({
  name:   "it_desk_sid",
  secret: process.env.SESSION_SECRET,
  resave: false,            // don't re-save sessions that haven't changed
  saveUninitialized: false, // don't create a session row until something is stored in it
  store: new PrismaSessionStore(prisma, {
    checkPeriod: 2 * 60 * 1000, // sweep expired sessions from the DB every 2 minutes
    dbRecordIdIsSessionId: true,
  }),
  cookie: {
    httpOnly: true, // client-side JS can never read this cookie — the #1 defense against XSS stealing a session
    // The frontend (Vercel) and this API (Render) live on different domains in
    // production, so the cookie needs SameSite=None + Secure to be sent cross-site
    // at all. Locally both run on http://localhost, where SameSite=None cookies
    // are rejected by browsers unless Secure — so we use Lax + non-secure instead.
    secure:   process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
  },
});

app.use(sessionMiddleware);

// ── Routes ────────────────────────────────────────────────────────────────────
// app.use("/api/auth", authRoutes) means:
// Any request to /api/auth/* gets handled by the authRoutes file.

app.use("/api/auth",     authRoutes);
app.use("/api/tasks",    taskRoutes);
app.use("/api/logs",     logRoutes);
app.use("/api/handover", handoverRoutes);
app.use("/api/assets",   assetRoutes);
app.use("/api/reports",  reportRoutes);
app.use("/api/users",    userRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "IT Desk API is running" });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Something went wrong on the server" });
});

// ── HTTP server + socket.io ───────────────────────────────────────────────────
// WHY WRAP app IN http.createServer()?
// app.listen() actually does this same wrapping under the hood — but socket.io
// needs direct access to the underlying HTTP server object so it can attach
// its own WebSocket upgrade handling alongside Express's normal request
// handling on the same port.
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// socket.io wants an (req, res, next) middleware like Express uses, but a
// socket connection only has a raw request, no response — this adapter just
// calls the same session middleware with an empty {} standing in for `res`.
// The effect: socket.request.session is the SAME session as the browser's
// logged-in HTTP session, because it's the same cookie being read.
const wrapMiddlewareForSocket = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);

io.use(wrapMiddlewareForSocket(sessionMiddleware));

// Reject any socket that isn't attached to a logged-in session — otherwise
// anyone could open a live connection to this server without ever logging in.
io.use((socket, next) => {
  if (socket.request.session?.userId) return next();
  next(new Error("unauthorized"));
});

io.on("connection", () => {
  // This server only ever emits events (task:created, log:updated, etc.) from
  // the REST routes below — it doesn't need to listen for anything the client
  // sends, so there's nothing to wire up here beyond accepting the connection.
});

// Make io reachable from route handlers as req.app.get("io").emit(...)
app.set("io", io);

// ── Start the server ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`\n  🟢 IT Desk API running on http://localhost:${PORT}`);
  console.log(`  📋 Health check: http://localhost:${PORT}/api/health\n`);
});
