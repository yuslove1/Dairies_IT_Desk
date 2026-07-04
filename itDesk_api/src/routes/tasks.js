// ─────────────────────────────────────────────────────────────────────────────
// src/routes/tasks.js — Task CRUD
//
// ENDPOINTS:
//   GET    /api/tasks        — list all tasks (optional ?status= filter)
//   POST   /api/tasks        — create a task
//   PATCH  /api/tasks/:id    — update a task (title, description, status, priority)
//   DELETE /api/tasks/:id    — delete a task
//
// KEY CONCEPTS:
//
// CRUD — Create, Read, Update, Delete. These 4 operations map to HTTP methods:
//   Create  → POST
//   Read    → GET
//   Update  → PUT (replace whole thing) or PATCH (change specific fields)
//   Delete  → DELETE
//
// We use PATCH (not PUT) because we only update the fields the user provides,
// not replace the entire task object.
//
// REST NAMING:
//   /api/tasks     → the collection (all tasks)
//   /api/tasks/:id → a single task (the :id is a URL parameter)
// ─────────────────────────────────────────────────────────────────────────────

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { protect }     = require("../middleware/auth");
const { requireRole } = require("../middleware/role");

const router = express.Router();
const prisma = new PrismaClient();

// Apply protect to ALL routes in this file — no unauthenticated access
// This is equivalent to writing "protect" on every single route below.
router.use(protect);

// ── GET /api/tasks ────────────────────────────────────────────────────────────
// Returns all tasks. Managers and staff can both read.
// Optional query param: /api/tasks?status=todo  or  ?status=wip
router.get("/", async (req, res) => {
  try {
    const { status } = req.query; // req.query holds URL query parameters

    // Build the "where" filter conditionally
    // If ?status= is provided, filter by it. Otherwise return everything.
    const where = status ? { status } : {};

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" }, // newest first
      include: {
        // "include" performs a JOIN — fetches the related User along with each task
        // This lets the frontend show the creator's name without a second request
        author: { select: { id: true, name: true, role: true } },
      },
    });

    res.json({ tasks });
  } catch (err) {
    console.error("Get tasks error:", err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// ── POST /api/tasks ───────────────────────────────────────────────────────────
// Creates a new task. Staff, managers, and admins can create tasks.
router.post("/", requireRole("staff", "manager", "admin"), async (req, res) => {
  try {
    const { title, description, category, priority, status, assignedTo } = req.body;

    if (!title) {
      return res.status(400).json({ error: "title is required" });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        category:    category   || "hardware",
        priority:    priority   || "med",
        status:      status     || "todo",
        assignedTo:  assignedTo || null,
        // req.user.userId comes from the session — the server sets who created it,
        // the client can't fake this.
        createdBy: req.user.userId,
      },
      // Include the author so this matches the shape GET /api/tasks returns —
      // both the HTTP response AND the socket event need the real name, not
      // just an ID, otherwise other connected clients see a blank assignee.
      include: {
        author: { select: { id: true, name: true, role: true } },
      },
    });

    // Tell every other connected client a task was created, in real time —
    // this is what powers the live task board (see lib/socket.js on the frontend).
    req.app.get("io").emit("task:created", task);

    // 201 = Created (more specific than 200 OK — something new was made)
    res.status(201).json({ task });
  } catch (err) {
    console.error("Create task error:", err);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// ── PATCH /api/tasks/:id ──────────────────────────────────────────────────────
// Updates task fields.
// - Staff      → can only update `status` (moving cards between columns)
// - Manager/Admin → can update all fields (title, description, category, priority, status)
router.patch("/:id", requireRole("staff", "manager", "admin"), async (req, res) => {
  try {
    const { id }   = req.params;
    const { role } = req.user; // set by protect middleware
    const { title, description, status, priority, category } = req.body;

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Task not found" });
    }

    const data = {};

    if (role === "staff") {
      // Staff may only move cards — no editing of content fields
      if (status !== undefined) data.status = status;
    } else {
      // Manager / admin can update any field
      if (title       !== undefined) data.title       = title;
      if (description !== undefined) data.description = description;
      if (status      !== undefined) data.status      = status;
      if (priority    !== undefined) data.priority    = priority;
      if (category    !== undefined) data.category    = category;
    }

    const task = await prisma.task.update({
      where: { id },
      data,
      include: {
        author: { select: { id: true, name: true, role: true } },
      },
    });
    req.app.get("io").emit("task:updated", task);
    res.json({ task });
  } catch (err) {
    console.error("Update task error:", err);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// ── DELETE /api/tasks/:id ─────────────────────────────────────────────────────
router.delete("/:id", requireRole("manager", "admin"), async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Task not found" });
    }

    await prisma.task.delete({ where: { id } });
    req.app.get("io").emit("task:deleted", { id });

    // 204 = No Content — success, but nothing to return
    res.status(204).send();
  } catch (err) {
    console.error("Delete task error:", err);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

module.exports = router;
