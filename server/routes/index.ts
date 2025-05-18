import { Express } from "express";
import adminRoutes from "./api/admin";

export async function registerRoutes(app: Express) {
  // Register API routes
  app.use("/api/admin", adminRoutes);
} 