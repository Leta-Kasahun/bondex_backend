// src/config/prisma.ts
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg"; // adapter for PostgreSQL
import { env } from "./env.config";

const connectionString = env.DATABASE_URL;

const adapter = new PrismaPg({connectionString});

const prisma =new PrismaClient({adapter})
export default prisma;
