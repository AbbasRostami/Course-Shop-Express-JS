import fs from "fs";
import winston from "winston";

// [SETUP] Ensure log directory
fs.mkdirSync("logs", { recursive: true });

// [UTIL] Send telegram message
const sendToTelegram = async (message: string) => {
  const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!TOKEN || !CHAT_ID) return;

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      },
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Telegram API failed:", errorText);
    }
  } catch (err) {
    console.error("❌ Telegram send failed:", err);
  }
};

// [LOG] Winston logger
export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
    }),
  ],
});

// [UTIL] Parse user agent
const parseUserAgent = (ua: string = "") => {
  const lower = ua.toLowerCase();

  let device = "🖥 Desktop";
  if (/iphone|ipad/.test(lower)) device = "📱 iPhone/iPad";
  else if (/android.*mobile/.test(lower)) device = "📱 Android Phone";
  else if (/android/.test(lower)) device = "📱 Android Tablet";
  else if (/mobile/.test(lower)) device = "📱 Mobile";

  let browser = "Unknown";
  if (/edg\//.test(lower)) browser = "Microsoft Edge";
  else if (/opr\/|opera/.test(lower)) browser = "Opera";
  else if (/chrome/.test(lower) && !/edg\/|opr\//.test(lower))
    browser = "Chrome";
  else if (/firefox/.test(lower)) browser = "Firefox";
  else if (/safari/.test(lower) && !/chrome/.test(lower)) browser = "Safari";

  let os = "Unknown";
  if (/windows nt 10/.test(lower)) os = "Windows 10/11";
  else if (/windows nt/.test(lower)) os = "Windows";
  else if (/mac os x/.test(lower)) os = "macOS";
  else if (/iphone os|ipad/.test(lower)) os = "iOS";
  else if (/android/.test(lower)) os = "Android";
  else if (/linux/.test(lower)) os = "Linux";

  return { browser, os, device };
};

// [UTIL] Format uptime
const getUptime = () => {
  const seconds = Math.floor(process.uptime());
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
};

// [UTIL] Escape HTML
const escapeHtml = (text: string) => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
};

// [UTIL] Format Tehran time
const formatTime = () => {
  const now = new Date();
  const date = now.toLocaleDateString("en-GB", {
    timeZone: "Asia/Tehran",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = now.toLocaleTimeString("en-GB", {
    timeZone: "Asia/Tehran",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return `${date} - ${time}`;
};

// [CONST] HTTP method icons
const METHOD_ICONS: Record<string, string> = {
  GET: "🔵",
  POST: "🟢",
  PUT: "🟡",
  PATCH: "🟣",
  DELETE: "🔴",
};

// [ALERT] Send error report
export const sendErrorToTelegram = async (params: {
  statusCode: number;
  method: string;
  path: string;
  message: string;
  stack?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
}) => {
  const time = formatTime();
  const ua = parseUserAgent(params.userAgent);
  const methodEmoji = METHOD_ICONS[params.method] || "⚪";

  const stackTrace = params.stack
    ? `\n<b>📜 Stack Trace:</b>\n<pre><code>${escapeHtml(params.stack.slice(0, 1500))}</code></pre>`
    : "";

  const message = `🚨 <b>SERVER ERROR DETECTED</b> 🚨

━━━━━━━━━━━━━━━━━━━━━━━

<b>🕐 Time:</b> <i>${time}</i>
<b>⏱ Uptime:</b> <code>${getUptime()}</code>
<b>📡 Status:</b> <code>${params.statusCode}</code>

<b>🎯 Endpoint:</b>
${methodEmoji} <code>${params.method}</code> <code>${escapeHtml(params.path)}</code>

<b>💬 Error Message:</b>
<pre>${escapeHtml(params.message)}</pre>
${stackTrace}

━━━━━━━━━━━━━━━━━━━━━━━

<b>👤 User Info:</b>
├ <b>ID:</b> <code>${params.userId || "Guest / Unknown"}</code>
├ <b>IP:</b> <code>${params.ip || "Unknown"}</code>
├ <b>Device:</b> ${ua.device}
├ <b>Browser:</b> ${ua.browser}
└ <b>OS:</b> ${ua.os}
`;

  await sendToTelegram(message);
};
