import { PrismaClient } from "@prisma/client";

// A single shared Prisma instance — re-instantiating it per request
// exhausts Postgres connections fast, this is the standard pattern.
export const prisma = new PrismaClient();
