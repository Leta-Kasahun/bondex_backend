// src/config/prisma.ts
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg"; // adapter for PostgreSQL
const connectionString=`${process.env.DATABASE_URL}`
// Create PostgreSQL adapter
const adapter = new PrismaPg({connectionString});

// Prisma Client with adapter
const prisma =new PrismaClient({adapter})

export default prisma;
