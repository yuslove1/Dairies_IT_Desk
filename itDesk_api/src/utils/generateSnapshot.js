// ─────────────────────────────────────────────────────────────────────────────
// src/utils/generateSnapshot.js
//
// WHAT IS A SNAPSHOT?
// When a staff member clicks "Share Report", we don't want to give managers a
// live link that changes as tasks move around. We want a frozen copy of the
// data at that exact moment — like a photograph.
//
// HOW IT WORKS:
// 1. We fetch all current tasks, today's logs, and active handover notes
// 2. We package them into a single JSON object (the "snapshot")
// 3. We store that JSON in the Report table
// 4. We generate a short unique token with nanoid and build a public URL
// 5. That URL never changes — it always shows the same frozen data
//
// WHY nanoid INSTEAD OF uuid?
// nanoid generates shorter IDs (e.g. "V1StGXR8") — better for URLs.
// uuid generates long IDs (e.g. "550e8400-e29b-41d4-a716") — better for DB keys.
// ─────────────────────────────────────────────────────────────────────────────

const { PrismaClient } = require("@prisma/client");
// nanoid v3 uses CommonJS require (v4+ is ESM only, which doesn't work with require())
const { nanoid } = require("nanoid");

const prisma = new PrismaClient();

async function generateSnapshot(userId) {
  // Fetch everything we need for the report in parallel
  // Promise.all() runs all three DB queries at the same time — faster than one by one
  const [tasks, logs, user] = await Promise.all([
    prisma.task.findMany({
      where: { NOT: { status: "done" } }, // only open tasks in the report
      orderBy: { createdAt: "desc" },
    }),
    prisma.log.findMany({
      where: {
        // Today's logs only — filter by the start of today
        logDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
      orderBy: { logDate: "asc" },
    }),
    prisma.user.findUnique({ where: { id: userId } }),
  ]);

  // Build the snapshot object — this is exactly what the report page will display
  const snapshot = {
    generatedAt: new Date().toISOString(),
    generatedBy: { name: user.name, role: user.role },
    stats: {
      todo: tasks.filter((t) => t.status === "todo").length,
      wip:  tasks.filter((t) => t.status === "wip").length,
      done: (await prisma.task.count({ where: { status: "done" } })),
    },
    openTasks: tasks.map((t) => ({ id: t.id, title: t.title, status: t.status, priority: t.priority })),
    logs: logs.map((l) => ({ id: l.id, content: l.content, category: l.category, logDate: l.logDate })),
  };

  // Generate a short unique token for the public URL
  const token = nanoid(10); // e.g. "V1StGXR8_K"

  // 24 hours from now
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Save the snapshot to the database
  const report = await prisma.report.create({
    data: { token, snapshot, expiresAt, createdBy: userId },
  });

  // Return the public URL — the frontend will copy this to clipboard
  const url = `${process.env.CLIENT_URL}/report/${report.token}`;
  return { url, token: report.token };
}

module.exports = { generateSnapshot };
