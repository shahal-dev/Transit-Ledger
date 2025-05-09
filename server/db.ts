import { Pool } from 'pg';
import prisma from './prisma-client';
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create a pool for session store
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default prisma;