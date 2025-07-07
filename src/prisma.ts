import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
} // Ensure that the Prisma Client is not re-instantiated in development mode
// This prevents the "Too many clients" error in development environments where hot reloading occurs.
