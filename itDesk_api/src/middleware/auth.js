// ─────────────────────────────────────────────────────────────────────────────
// src/middleware/auth.js — JWT verification middleware
//
// WHAT IS MIDDLEWARE?
// A middleware function sits between the incoming HTTP request and your route
// handler. It can read the request, modify it, and either pass it along (next())
// or reject it by sending a response (res.status(401).json(...)).
//
// HOW JWT AUTH WORKS (the short version):
// 1. User logs in  →  server creates a signed token containing { userId, role }
// 2. Frontend stores that token in localStorage
// 3. On every protected request, the frontend sends:
//      Authorization: Bearer eyJhbGci...
// 4. THIS middleware reads that header, verifies the token wasn't tampered with,
//    and attaches the decoded payload to req.user so your routes can use it.
//
// WHY "Bearer"?
// It's just a convention from the OAuth spec. "Bearer" means "whoever holds
// this token is allowed in". The actual token is everything after the space.
// ─────────────────────────────────────────────────────────────────────────────

const jwt = require("jsonwebtoken");

function protect(req, res, next) {
  // 1. Read the Authorization header
  const authHeader = req.headers.authorization;

  // 2. Check the header exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // 401 = "Unauthorized" — the request has no (or invalid) credentials
    return res.status(401).json({ error: "No token provided. Please log in." });
  }

  // 3. Extract just the token string (everything after "Bearer ")
  const token = authHeader.split(" ")[1];

  try {
    // 4. Verify the token using our secret key
    // jwt.verify() will throw an error if:
    //   - the token was tampered with (signature mismatch)
    //   - the token has expired
    //   - the token is completely invalid
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Attach the decoded payload to the request object
    // Now any route handler after this middleware can access:
    //   req.user.userId  — the logged-in user's ID
    //   req.user.role    — "staff" | "manager" | "admin"
    req.user = decoded;

    // 6. Pass control to the next function (the actual route handler)
    next();
  } catch (err) {
    // Token was invalid or expired
    return res.status(401).json({ error: "Invalid or expired token. Please log in again." });
  }
}

module.exports = { protect };
