// ─────────────────────────────────────────────────────────────────────────────
// src/routes/auth.js — Authentication routes
//
// ENDPOINTS:
//   POST /api/auth/register    — create account + send 6-digit OTP email
//   POST /api/auth/verify-otp  — verify OTP, mark user as verified, return JWT
//   POST /api/auth/resend-otp  — resend OTP (new code, new 10-min window)
//   POST /api/auth/login       — returns JWT (only for verified accounts)
//   GET  /api/auth/me          — returns the logged-in user's profile
// ─────────────────────────────────────────────────────────────────────────────

const express = require("express");
const bcrypt  = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { generateToken } = require("../utils/generateToken");
const { protect }       = require("../middleware/auth");
const { sendOtp }       = require("../utils/sendOtp");

const router = express.Router();
const prisma = new PrismaClient();

// ── Helper: generate a cryptographically random 6-digit OTP ──────────────────
function generateOtp() {
  // Math.random() is fine for short-lived OTPs — no need for crypto here
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ── POST /api/auth/register ───────────────────────────────────────────────────
// Creates a new unverified account and emails a 6-digit OTP.
// The account cannot log in until /verify-otp is called successfully.
router.post("/register", async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "email, password, and name are required" });
    }

    // Check for existing account
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      // If already registered but not verified, resend a fresh OTP
      if (!existing.isVerified) {
        const otp          = generateOtp();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await prisma.user.update({
          where: { email },
          data:  { verificationOtp: otp, otpExpiresAt },
        });
        await sendOtp(email, existing.name, otp);
        return res.status(200).json({
          message: "Account exists but is unverified. A new OTP has been sent.",
          email,
          requiresVerification: true,
        });
      }
      return res.status(409).json({ error: "A user with that email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const otp          = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role:            ["staff", "manager", "admin"].includes(role) ? role : "staff",
        isVerified:      false,
        verificationOtp: otp,
        otpExpiresAt,
      },
    });

    // Send OTP email — don't await it in the response path so it doesn't slow things down
    sendOtp(email, name, otp).catch((err) => console.error("OTP email error:", err));

    // DEV ONLY: print OTP to terminal so you can verify without waiting for email
    if (process.env.NODE_ENV !== "production") {
      console.log(`\n🔑 OTP for ${email}: ${otp}\n`);
    }

    res.status(201).json({
      message:              "Account created. Check your email for the verification code.",
      email:                user.email,
      requiresVerification: true,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// ── POST /api/auth/verify-otp ─────────────────────────────────────────────────
// Takes { email, otp } and verifies the account.
// Returns a JWT so the user is logged in immediately after verification.
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: "email and otp are required" });

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user)                                            return res.status(404).json({ error: "No account found for this email" });
    if (user.isVerified)                                  return res.status(400).json({ error: "This account is already verified" });
    if (!user.verificationOtp || !user.otpExpiresAt)      return res.status(400).json({ error: "No verification code found. Request a new one." });
    if (user.otpExpiresAt < new Date())                   return res.status(400).json({ error: "This code has expired. Request a new one." });
    if (user.verificationOtp !== otp.trim())              return res.status(400).json({ error: "Incorrect code. Please try again." });

    // Mark verified, clear OTP fields
    const verified = await prisma.user.update({
      where: { email },
      data:  { isVerified: true, verificationOtp: null, otpExpiresAt: null },
    });

    // Issue JWT — user is now logged in
    const token = generateToken(verified);
    res.json({
      message: "Email verified successfully. Welcome!",
      token,
      user: { id: verified.id, email: verified.email, name: verified.name, role: verified.role },
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ error: "Server error during verification" });
  }
});

// ── POST /api/auth/resend-otp ─────────────────────────────────────────────────
// Generates a fresh 6-digit OTP and emails it.
// Use this when the user's code has expired or they didn't receive it.
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "email is required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)          return res.status(404).json({ error: "No account found for this email" });
    if (user.isVerified) return res.status(400).json({ error: "This account is already verified" });

    const otp          = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data:  { verificationOtp: otp, otpExpiresAt },
    });

    sendOtp(email, user.name, otp).catch((err) => console.error("Resend OTP error:", err));

    res.json({ message: "A new verification code has been sent to your email." });
  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) return res.status(401).json({ error: "Invalid email or password" });

    // Block login for unverified accounts
    if (!user.isVerified) {
      return res.status(403).json({
        error:                "Please verify your email before logging in.",
        requiresVerification: true,
        email:                user.email,
      });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get("/me", protect, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where:  { id: req.user.userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error("Me error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
