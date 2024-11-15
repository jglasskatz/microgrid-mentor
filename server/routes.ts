import type { Express } from "express";
import { handleAICoach } from "./ai-coach";

export function registerRoutes(app: Express) {
  app.post("/api/ai-coach", handleAICoach);
}
