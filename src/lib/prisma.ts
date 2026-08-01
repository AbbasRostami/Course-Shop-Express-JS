import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { PrismaClient } from "../../generated/prisma/client.js";

// [CONFIG] Database connection string
const connectionString = `${process.env.DATABASE_URL}`;

// [DB] Prisma PostgreSQL adapter
const adapter = new PrismaPg({ connectionString });

// [DB] Prisma client instance
const prisma = new PrismaClient({ adapter });

export { prisma };
