// src/utils/sendOtp.js — Sends OTP verification emails via Nodemailer
//
// HOW IT WORKS:
// Nodemailer creates a "transporter" using your SMTP credentials.
// We call transporter.sendMail() with the OTP embedded in a styled HTML email.
//
// SETUP:
// Add these to your .env file:
//   EMAIL_HOST=smtp.gmail.com
//   EMAIL_PORT=587
//   EMAIL_USER=your@gmail.com
//   EMAIL_PASS=your-gmail-app-password   ← NOT your normal password
//   EMAIL_FROM="IT Desk <noreply@uacfoods.com>"
//
// For Gmail, generate an App Password at:
//   https://myaccount.google.com/apppasswords
//   (requires 2-Step Verification to be enabled)

const nodemailer = require("nodemailer");

// Build transporter once — reused for all emails
const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST || "smtp.gmail.com",
  port:   parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_PORT === "465", // true for port 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends a 6-digit OTP to the given email address.
 * @param {string} to      — recipient email
 * @param {string} name    — recipient's first name (for personalisation)
 * @param {string} otp     — the 6-digit code
 */
async function sendOtp(to, name, otp) {
  const from = process.env.EMAIL_FROM || `"IT Desk" <${process.env.EMAIL_USER}>`;

  // Split OTP into individual digits for the styled box layout
  const digits = otp.split("").map(
    (d) => `<td style="width:40px;height:48px;text-align:center;vertical-align:middle;
                        background:#f5f5f0;border:1.5px solid #e0ddd8;border-radius:6px;
                        font-family:monospace;font-size:22px;font-weight:700;color:#1a1814;">${d}</td>`,
  ).join("<td style='width:8px'></td>");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e0ddd8;border-radius:14px;overflow:hidden;max-width:480px;">

        <!-- Header -->
        <tr>
          <td style="background:#7b1c1c;padding:24px 32px;border-bottom:3px solid #00793a;">
            <p style="margin:0;font-family:monospace;font-size:13px;font-weight:700;color:#ffffff;letter-spacing:0.05em;">
              ● &nbsp;IT DESK
            </p>
            <p style="margin:4px 0 0;font-family:monospace;font-size:10px;color:rgba(255,255,255,0.35);">
              UAC Foods Dairies Plant · IT Department
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#1a1814;">
              Verify your email
            </p>
            <p style="margin:0 0 24px;font-size:13px;color:#6b6860;line-height:1.6;">
              Hi ${name.split(" ")[0]}, enter this code in the IT Desk app to verify your account.
              The code expires in <strong>10 minutes</strong>.
            </p>

            <!-- OTP boxes -->
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
              <tr>${digits}</tr>
            </table>

            <p style="margin:0 0 24px;font-size:11px;color:#9c9890;text-align:center;font-family:monospace;">
              Code: ${otp} &nbsp;·&nbsp; Valid for 10 minutes
            </p>

            <hr style="border:none;border-top:1px solid #e0ddd8;margin:0 0 20px;">

            <p style="margin:0;font-size:11px;color:#9c9890;line-height:1.6;">
              If you didn't create an IT Desk account, you can safely ignore this email.
              Someone may have entered your email address by mistake.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px;background:#f9f9f7;border-top:1px solid #e0ddd8;">
            <p style="margin:0;font-family:monospace;font-size:9px;color:#b0ada8;text-align:center;">
              UAC Foods Dairies Plant · IT Desk v1.0 · Confidential
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from,
    to,
    subject: `${otp} is your IT Desk verification code`,
    text:    `Your IT Desk verification code is: ${otp}\n\nIt expires in 10 minutes.\n\nIf you didn't sign up, ignore this email.`,
    html,
  });
}

module.exports = { sendOtp };
