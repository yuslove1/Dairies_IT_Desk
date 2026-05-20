// ─────────────────────────────────────────────────────────────────────────────
// src/middleware/role.js — Role-based access control (RBAC)
//
// WHAT IS RBAC?
// Different users should have different permissions.
//   - A staff member can create tasks and logs
//   - A manager can only read
//   - An admin can do everything including managing users
//
// HOW TO USE:
// This file exports a factory function — a function that RETURNS a middleware.
// You call it with the allowed roles:
//
//   router.post("/", protect, requireRole("staff", "admin"), createTask);
//
// This means: "only staff and admin can reach the createTask handler".
// Managers calling POST /api/tasks will get a 403 Forbidden response.
//
// WHY A FACTORY FUNCTION?
// Because we want to configure the middleware per route.
// A regular function can only do one fixed thing. A factory lets us say
// "give me a middleware that allows THESE specific roles".
// ─────────────────────────────────────────────────────────────────────────────

function requireRole(...allowedRoles) {
  // This inner function IS the actual middleware Express will call
  return function (req, res, next) {
    // req.user was attached by the protect middleware before this runs.
    // If protect wasn't applied first, req.user won't exist.
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Check if the user's role is in the allowed list
    // allowedRoles is an array like ["staff", "admin"]
    // .includes() returns true if the user's role is in that array
    if (!allowedRoles.includes(req.user.role)) {
      // 403 = "Forbidden" — authenticated but not authorised for this action
      return res.status(403).json({
        error: `Access denied. Required role: ${allowedRoles.join(" or ")}`,
      });
    }

    // Role check passed — continue to the route handler
    next();
  };
}

module.exports = { requireRole };
