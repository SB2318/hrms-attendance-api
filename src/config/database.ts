import { PrismaClient } from "@prisma/client";

// Singleton pattern — avoids multiple connections in dev 
const createPrismaClient = (): PrismaClient => {
  return new PrismaClient({
    log: process.env["NODE_ENV"] === "development"
      ? ["query", "warn", "error"]
      : ["error"],
  });
};

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env["NODE_ENV"] !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
