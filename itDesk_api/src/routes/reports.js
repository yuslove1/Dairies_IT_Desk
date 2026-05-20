// src/routes/reports.js — Shareable snapshot report
// ENDPOINTS:
//   POST /api/reports          — generate a snapshot (staff/admin only), returns { url }
//   GET  /api/reports/:token   — fetch snapshot by token (PUBLIC — no auth required)

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { protect }          = require("../middleware/auth");
const { requireRole }      = require("../middleware/role");
const { generateSnapshot } = require("../utils/generateSnapshot");

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/reports — generate a new snapshot and return the shareable URL
// Only staff/admin can generate reports. Managers just view them.
router.post("/", protect, requireRole("staff", "admin"), async (req, res) => {
  try {
    const result = await generateSnapshot(req.user.userId);
    res.status(201).json(result); // { url, token }
  } catch (err) {
    console.error("Generate report error:", err);
    res.status(500).json({ error: "Failed to generate report" });
  }
});

// GET /api/reports/:token — PUBLIC route, no protect middleware
// Anyone with the link can view the snapshot (e.g. the manager via WhatsApp).
// Returns 410 Gone if the token has expired.
router.get("/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const report = await prisma.report.findUnique({ where: { token } });

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    // Check expiry — 410 Gone is more specific than 404 for expired resources
    if (report.expiresAt < new Date()) {
      return res.status(410).json({ error: "This report has expired" });
    }

    // Return the frozen snapshot data
    res.json({ snapshot: report.snapshot, expiresAt: report.expiresAt });
  } catch (err) {
    console.error("Get report error:", err);
    res.status(500).json({ error: "Failed to fetch report" });
  }
});

module.exports = router;
