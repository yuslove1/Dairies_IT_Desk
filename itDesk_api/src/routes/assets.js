// src/routes/assets.js — Asset register CRUD
// ENDPOINTS: GET / POST / PATCH /:id / DELETE /:id
// All routes require authentication. Mutations require staff or admin role.

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { protect }     = require("../middleware/auth");
const { requireRole } = require("../middleware/role");

const router = express.Router();
const prisma = new PrismaClient();

router.use(protect);

// GET /api/assets — list all assets, optional filters: ?status= ?type= ?department=
router.get("/", async (req, res) => {
  try {
    const { status, type, department } = req.query;
    const where = {};
    if (status)     where.status     = status;
    if (type)       where.type       = type;
    if (department) where.department = department;

    const assets = await prisma.asset.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { author: { select: { id: true, name: true } } },
    });
    res.json({ assets });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch assets" });
  }
});

// GET /api/assets/:id — single asset detail
router.get("/:id", async (req, res) => {
  try {
    const asset = await prisma.asset.findUnique({
      where: { id: req.params.id },
      include: { author: { select: { id: true, name: true } } },
    });
    if (!asset) return res.status(404).json({ error: "Asset not found" });
    res.json({ asset });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch asset" });
  }
});

// POST /api/assets — register a new asset
router.post("/", requireRole("staff", "manager", "admin"), async (req, res) => {
  try {
    const { name, type, serialNumber, location, department, status, purchaseDate, warrantyExpiry, notes } = req.body;

    if (!name || !type || !location || !department) {
      return res.status(400).json({ error: "name, type, location, and department are required" });
    }

    const asset = await prisma.asset.create({
      data: {
        name,
        type,
        serialNumber:   serialNumber   || null,
        location,
        department,
        status:         status         || "active",
        purchaseDate:   purchaseDate   ? new Date(purchaseDate)   : null,
        warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
        notes:          notes          || null,
        addedBy:        req.user.userId,
      },
    });

    res.status(201).json({ asset });
  } catch (err) {
    console.error("Create asset error:", err);
    res.status(500).json({ error: "Failed to register asset" });
  }
});

// PATCH /api/assets/:id — update status, location, notes, etc.
router.patch("/:id", requireRole("manager", "admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.asset.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Asset not found" });

    const { name, type, serialNumber, location, department, status, purchaseDate, warrantyExpiry, notes } = req.body;

    const data = {};
    if (name           !== undefined) data.name           = name;
    if (type           !== undefined) data.type           = type;
    if (serialNumber   !== undefined) data.serialNumber   = serialNumber;
    if (location       !== undefined) data.location       = location;
    if (department     !== undefined) data.department     = department;
    if (status         !== undefined) data.status         = status;
    if (purchaseDate   !== undefined) data.purchaseDate   = new Date(purchaseDate);
    if (warrantyExpiry !== undefined) data.warrantyExpiry = new Date(warrantyExpiry);
    if (notes          !== undefined) data.notes          = notes;

    const asset = await prisma.asset.update({ where: { id }, data });
    res.json({ asset });
  } catch (err) {
    res.status(500).json({ error: "Failed to update asset" });
  }
});

// DELETE /api/assets/:id — hard delete (consider status:"retired" instead)
router.delete("/:id", requireRole("manager", "admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.asset.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Asset not found" });
    await prisma.asset.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete asset" });
  }
});

module.exports = router;
