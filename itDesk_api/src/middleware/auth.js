// ─────────────────────────────────────────────────────────────────────────────
// src/middleware/auth.js — Session verification middleware
//
// WHAT IS MIDDLEWARE?
// A middleware function sits between the incoming HTTP request and your route
// handler. It can read the request, modify it, and either pass it along (next())
// or reject it by sending a response (res.status(401).json(...)).
//
// HOW SESSION AUTH WORKS (the short version):
// 1. User logs in  →  server creates a session record in the DB and sends the
//    browser a cookie containing only a random session ID (sid) — no user data.
// 2. The browser sends that cookie automatically on every request to this API
//    (that's what `credentials: true` / `withCredentials` is for on the frontend).
// 3. express-session (wired up in index.js) reads the cookie, looks up the
//    matching session row via the Prisma store, and populates req.session.
// 4. THIS middleware just checks whether req.session has a logged-in user on it,
//    and if so, attaches a plain { userId, role } to req.user so the rest of the
//    app doesn't need to know or care that sessions replaced JWT.
//
// WHY THIS IS DIFFERENT FROM JWT:
// A JWT is self-contained — the server can verify it without a database lookup,
// but it also can't be revoked before it expires. A session is a DB lookup on
// every request, but logging out (destroying the session row) immediately and
// permanently ends that session — there's no "wait for the token to expire".
// ─────────────────────────────────────────────────────────────────────────────

function protect(req, res, next) {
  // req.session is created by express-session for every request (even logged-out
  // ones — it's just empty). We only care whether it carries a userId.
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "No active session. Please log in." });
  }

  // Attach a plain object shaped just like the old JWT payload so every route
  // handler downstream (tasks.js, logs.js, etc.) works unchanged.
  req.user = {
    userId: req.session.userId,
    role:   req.session.role,
  };

  next();
}

module.exports = { protect };
