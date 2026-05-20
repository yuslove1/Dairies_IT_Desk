// src/routes/handover.js — Handover notes CRUD
// ENDPOINTS: GET / POST / PATCH /:id / DELETE /:id

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { protect }     = require("../middleware/auth");
const { requireRole } = require("../middleware/role");

const router = express.Router();
const prisma = new PrismaClient();

router.use(protect);

// GET /api/handover — active notes by default, ?all=true includes archived
router.get("/", async (req, res) => {
  try {
    const showAll = req.query.all === "true";
    const notes = await prisma.handoverNote.findMany({
      where: showAll ? {} : { isActive: true },
      orderBy: { createdAt: "desc" },
      include: { author: { select: { id: true, name: true } } },
    });
    res.json({ notes });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch handover notes" });
  }
});

// POST /api/handover
router.post("/", requireRole("staff", "manager", "admin"), async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ error: "title and content are required" });
    const note = await prisma.handoverNote.create({
      data: { title, content, isActive: true, createdBy: req.user.userId },
    });
    res.status(201).json({ note });
  } catch (err) {
    res.status(500).json({ error: "Failed to create handover note" });
  }
});

// PATCH /api/handover/:id — update fields or toggle isActive (soft-archive)
router.patch("/:id", requireRole("manager", "admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, isActive } = req.body;
    const existing = await prisma.handoverNote.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Note not found" });
    const data = {};
    if (title    !== undefined) data.title    = title;
    if (content  !== undefined) data.content  = content;
    if (isActive !== undefined) data.isActive = isActive;
    const note = await prisma.handoverNote.update({ where: { id }, data });
    res.json({ note });
  } catch (err) {
    res.status(500).json({ error: "Failed to update handover note" });
  }
});

// DELETE /api/handover/:id — hard delete (prefer PATCH {isActive:false} for archiving)
router.delete("/:id", requireRole("manager", "admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.handoverNote.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Note not found" });
    await prisma.handoverNote.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete handover note" });
  }
});

module.exports = router;
