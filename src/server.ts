import "dotenv/config";

import app from "./app.js";
import { prisma } from "./lib/prisma.js";

// [CONFIG] Server port
const PORT = process.env.PORT || 3000;

// [SERVER] Start HTTP server
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(
    `📚 API Docs: ${process.env.BACKEND_URL || `http://localhost:${PORT}`}/api-docs`,
  );
});

// [UTIL] Graceful shutdown handler
const shutdown = async (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  // [SERVER] Close HTTP server
  await new Promise<void>((resolve, reject) => {
    server.close((err) => {
      if (err) return reject(err);
      console.log("HTTP server closed.");
      resolve();
    });
  });

  // [DB] Disconnect Prisma
  await prisma.$disconnect();
  console.log("Database disconnected.");

  process.exit(0);
};

// [PROCESS] Handle termination signals
process.on("SIGTERM", () => {
  shutdown("SIGTERM").catch((err) => {
    console.error("Shutdown error:", err);
    process.exit(1);
  });
});

process.on("SIGINT", () => {
  shutdown("SIGINT").catch((err) => {
    console.error("Shutdown error:", err);
    process.exit(1);
  });
});