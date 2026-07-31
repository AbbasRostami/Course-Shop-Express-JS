import { google } from "googleapis";
import nodemailer from "nodemailer";

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// [EMAIL] Send via Gmail API (OAuth2)
const sendWithGmailApi = async (params: EmailParams) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground",
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  // [EMAIL] Encode subject and sender name in UTF-8
  const subject = `=?UTF-8?B?${Buffer.from(params.subject).toString("base64")}?=`;
  const fromName = `=?UTF-8?B?${Buffer.from("Course Shop").toString("base64")}?=`;
  const boundary = "boundary_course_shop";

  const message = [
    `From: ${fromName} <${process.env.GMAIL_SENDER_EMAIL}>`,
    `To: ${params.to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "",
    params.text || "",
    "",
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "",
    params.html,
    "",
    `--${boundary}--`,
  ].join("\r\n");

  // [EMAIL] Encode to base64url
  const raw = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });
};

// [EMAIL] Send via Gmail SMTP (fallback)
const sendWithGmailSmtp = async (params: EmailParams) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Course Shop" <${process.env.EMAIL_USER}>`,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });
};

// [EMAIL] Send email with auto strategy selection
export const sendEmail = async (params: EmailParams) => {
  try {
    if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_REFRESH_TOKEN) {
      await sendWithGmailApi(params);
    } else {
      await sendWithGmailSmtp(params);
    }
    console.log(`📧 Email sent to ${params.to}`);
  } catch (err) {
    console.error("❌ Email send failed:", err);
    throw err;
  }
};