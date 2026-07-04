// ─────────────────────────────────────────────────────────────────────────────
// src/routes/logs.js — Daily activity log CRUD
//
// ENDPOINTS:
//   GET    /api/logs          — get logs (optional ?date=YYYY-MM-DD filter)
//   POST   /api/logs          — create a log entry (staff/admin only)
//   PATCH  /api/logs/:id      — edit a log entry (manager/admin only)
//   DELETE /api/logs/:id      — delete a log entry (manager/admin only)
//
// NOTE ON DATE FILTERING:
// The ?date= query param lets the frontend load past days.
// We use a "range" query (gte/lte = greater-than-or-equal / less-than-or-equal)
// to capture all entries for an entire day, regardless of time.
// ─────────────────────────────────────────────────────────────────────────────

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { protect }     = require("../middleware/auth");
const { requireRole } = require("../middleware/role");

const router = express.Router();
const prisma = new PrismaClient();

router.use(protect); // all log routes require authentication

// ── GET /api/logs ─────────────────────────────────────────────────────────────
// Managers and staff can both read logs.
// ?date=2026-03-31 returns only entries for that day.
// No ?date defaults to today.
router.get("/", async (req, res) => {
  try {
    const { date } = req.query;

    // Build the date range for the query
    // If a date is provided, use it. Otherwise, use today.
    const targetDate = date ? new Date(date) : new Date();

    // Start of the day: 2026-03-31T00:00:00.000Z
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    // End of the day: 2026-03-31T23:59:59.999Z
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const logs = await prisma.log.findMany({
      where: {
        logDate: {
          gte: startOfDay, // >= start of day
          lte: endOfDay,   // <= end of day
        },
      },
      orderBy: { logDate: "asc" }, // chronological order
      include: {
        author: { select: { id: true, name: true } },
      },
    });

    res.json({ logs });
  } catch (err) {
    console.error("Get logs error:", err);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

// ── POST /api/logs ────────────────────────────────────────────────────────────
router.post("/", requireRole("staff", "manager", "admin"), async (req, res) => {
  try {
    const { content, category } = req.body;

    if (!content) {
      return res.status(400).json({ error: "content is required" });
    }

    const log = await prisma.log.create({
      data: {
        content,
        category: category || "routine",
        logDate:  new Date(), // timestamp is set server-side — client can't fake the time
        createdBy: req.user.userId,
      },
      // Match the shape GET /api/logs returns, so the socket event carries a
      // real author name, not just an ID.
      include: {
        author: { select: { id: true, name: true } },
      },
    });

    req.app.get("io").emit("log:created", log);
    res.status(201).json({ log });
  } catch (err) {
    console.error("Create log error:", err);
    res.status(500).json({ error: "Failed to create log entry" });
  }
});

// ── PATCH /api/logs/:id ───────────────────────────────────────────────────────
// Edits an existing log entry. Manager/admin only.
router.patch("/:id", requireRole("manager", "admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { content, category } = req.body;

    const existing = await prisma.log.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Log entry not found" });

    const data = {};
    if (content  !== undefined) data.content  = content;
    if (category !== undefined) data.category = category;

    const log = await prisma.log.update({
      where: { id },
      data,
      include: {
        author: { select: { id: true, name: true } },
      },
    });
    req.app.get("io").emit("log:updated", log);
    res.json({ log });
  } catch (err) {
    console.error("Update log error:", err);
    res.status(500).json({ error: "Failed to update log entry" });
  }
});

// ── DELETE /api/logs/:id ──────────────────────────────────────────────────────
router.delete("/:id", requireRole("manager", "admin"), async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.log.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Log entry not found" });
    }

    await prisma.log.delete({ where: { id } });
    req.app.get("io").emit("log:deleted", { id });
    res.status(204).send();
  } catch (err) {
    console.error("Delete log error:", err);
    res.status(500).json({ error: "Failed to delete log entry" });
  }
});

module.exports = router;
