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
// 5. Start listening on a port
// ─────────────────────────────────────────────────────────────────────────────

// dotenv reads your .env file and adds the variables to process.env
// e.g. process.env.PORT, process.env.JWT_SECRET
require("dotenv").config();

const express = require("express");
const cors    = require("cors");

// Import all route files (we'll create these next)
const authRoutes     = require("./src/routes/auth");
const taskRoutes     = require("./src/routes/tasks");
const logRoutes      = require("./src/routes/logs");
const handoverRoutes = require("./src/routes/handover");
const assetRoutes    = require("./src/routes/assets");
const reportRoutes   = require("./src/routes/reports");
const userRoutes     = require("./src/routes/users");

// ── Create the Express app ────────────────────────────────────────────────────
const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
// WHAT IS MIDDLEWARE?
// Middleware is a function that runs on EVERY request before it reaches your route.
// Think of it as a series of checkpoints a request passes through.

// cors() — Cross-Origin Resource Sharing
// Browsers block requests from one domain to another by default.
// We allow the configured CLIENT_URL plus common dev ports (3000 & 3001)
// because Next.js picks the next free port automatically.
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
// When a frontend sends: POST /api/tasks  { "title": "Fix printer" }
// This middleware makes that available as: req.body.title
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
// app.use("/api/auth", authRoutes) means:
// Any request to /api/auth/* gets handled by the authRoutes file.
// The "/api" prefix is a convention — it makes it obvious these are API endpoints,
// not regular web pages.

app.use("/api/auth",     authRoutes);
app.use("/api/tasks",    taskRoutes);
app.use("/api/logs",     logRoutes);
app.use("/api/handover", handoverRoutes);
app.use("/api/assets",   assetRoutes);
app.use("/api/reports",  reportRoutes);
app.use("/api/users",    userRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
// A simple endpoint to confirm the server is running.
// Test it with: curl http://localhost:4000/api/health
// Useful for deployment platforms (Railway/Render) to know the app is alive.
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "IT Desk API is running" });
});

// ── Global error handler ──────────────────────────────────────────────────────
// WHAT IS THIS?
// If any route throws an error and doesn't handle it, Express passes it here.
// The 4-parameter signature (err, req, res, next) is how Express knows this
// is an error handler — don't remove the "next" even if you don't use it.
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Something went wrong on the server" });
});

// ── Start the server ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\n  🟢 IT Desk API running on http://localhost:${PORT}`);
  console.log(`  📋 Health check: http://localhost:${PORT}/api/health\n`);
});
