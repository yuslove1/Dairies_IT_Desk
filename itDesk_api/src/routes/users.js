// src/routes/users.js — Staff directory (manager use only)
//
// ENDPOINTS:
//   GET /api/users        — list all staff users (managers/admins only)

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { protect }     = require("../middleware/auth");
const { requireRole } = require("../middleware/role");

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/users — returns all staff members for the assignee dropdown
router.get("/", protect, requireRole("manager", "admin"), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: "staff" },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" },
    });
    res.json({ users });
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

module.exports = router;
