// ─────────────────────────────────────────────────────────────────────────────
// src/utils/generateToken.js
//
// WHAT IS A JWT?
// JWT = JSON Web Token. It's a string with 3 base64-encoded parts separated by dots:
//
//   HEADER.PAYLOAD.SIGNATURE
//
//   Header   — algorithm used (HS256)
//   Payload  — the data we stored: { userId, role, email }
//   Signature — a hash of header + payload using our JWT_SECRET
//
// The signature is what makes JWTs trustworthy.
// If anyone modifies the payload (e.g. changes role to "admin"),
// the signature won't match anymore and jwt.verify() will reject it.
//
// WHAT THIS FUNCTION DOES:
// Takes a user object, signs a token with their ID and role baked in,
// and returns the token string to be sent to the frontend.
// ─────────────────────────────────────────────────────────────────────────────

const jwt = require("jsonwebtoken");

function generateToken(user) {
  // The payload — this data is readable by anyone (it's base64, not encrypted).
  // So NEVER put sensitive info like passwords here.
  // The signature just proves it hasn't been tampered with.
  const payload = {
    userId: user.id,
    email:  user.email,
    role:   user.role,
    name:   user.name,
  };

  // jwt.sign(payload, secret, options)
  // expiresIn adds an "exp" field to the payload — jwt.verify() checks this automatically.
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

module.exports = { generateToken };
