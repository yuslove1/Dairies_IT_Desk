// src/utils/sendOtp.js — Sends OTP emails via Gmail REST API (HTTPS)
// This bypasses Render's SMTP port blocking by sending over standard port 443.

/**
 * Sends a 6-digit OTP to the given email address.
 * @param {string} to      — recipient email
 * @param {string} name    — recipient's first name (for personalisation)
 * @param {string} otp     — the 6-digit code
 */
async function sendOtp(to, name, otp) {
  if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET || !process.env.GMAIL_REFRESH_TOKEN) {
    console.error("Missing Gmail OAuth2 environment variables.");
    return;
  }

  const senderEmail = process.env.EMAIL_FROM || "IT Desk <itdeskotp@gmail.com>";
  const subject = `${otp} is your IT Desk verification code`;

  // 1. Get a fresh Access Token using the Refresh Token
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GMAIL_CLIENT_ID,
      client_secret: process.env.GMAIL_CLIENT_SECRET,
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });

  const tokenData = await tokenResponse.json();
  if (!tokenResponse.ok) {
    throw new Error(`Failed to refresh token: ${JSON.stringify(tokenData)}`);
  }
  const accessToken = tokenData.access_token;

  // 2. Build the HTML content
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
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#1a1814;">
              Verify your email
            </p>
            <p style="margin:0 0 24px;font-size:13px;color:#6b6860;line-height:1.6;">
              Hi ${name.split(" ")[0]}, enter this code in the IT Desk app to verify your account.
              The code expires in <strong>10 minutes</strong>.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
              <tr>${digits}</tr>
            </table>
            <p style="margin:0 0 24px;font-size:11px;color:#9c9890;text-align:center;font-family:monospace;">
              Code: ${otp} &nbsp;·&nbsp; Valid for 10 minutes
            </p>
            <hr style="border:none;border-top:1px solid #e0ddd8;margin:0 0 20px;">
            <p style="margin:0;font-size:11px;color:#9c9890;line-height:1.6;">
              If you didn't create an IT Desk account, you can safely ignore this email.
            </p>
          </td>
        </tr>
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

  // 3. Build the raw MIME message
  const emailLines = [
    `From: ${senderEmail}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `Content-Type: text/html; charset=utf-8`,
    "",
    html
  ];
  const rawMessage = emailLines.join("\r\n");

  // 4. Base64-URL encode it
  const encodedMessage = Buffer.from(rawMessage)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  // 5. Send via Gmail REST API (over HTTPS, port 443)
  const sendResponse = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw: encodedMessage }),
  });

  if (!sendResponse.ok) {
    const errData = await sendResponse.json();
    throw new Error(`Gmail API Send Error: ${JSON.stringify(errData)}`);
  }

  const result = await sendResponse.json();
  return result;
}

module.exports = { sendOtp };
