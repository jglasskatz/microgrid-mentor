import type { Express } from "express";
import { handleAICoach } from "./ai-coach";
import { db } from "db";
import { designs } from "db/schema";
import { desc, eq } from "drizzle-orm";

export function registerRoutes(app: Express) {
  app.post("/api/ai-coach", handleAICoach);

  // Save design
  app.post("/api/designs", async (req, res) => {
    try {
      const { name, components } = req.body;
      const result = await db.insert(designs).values({
        name,
        components,
      }).returning();
      res.json(result[0]);
    } catch (error) {
      console.error("Failed to save design:", error);
      res.status(500).json({ error: "Failed to save design" });
    }
  });

  // Get all designs
  app.get("/api/designs", async (req, res) => {
    try {
      const allDesigns = await db.query.designs.findMany({
        orderBy: [desc(designs.created_at)],
      });
      res.json(allDesigns);
    } catch (error) {
      console.error("Failed to fetch designs:", error);
      res.status(500).json({ error: "Failed to fetch designs" });
    }
  });

  // Get design by id
  app.get("/api/designs/:id", async (req, res) => {
    try {
      const design = await db.query.designs.findFirst({
        where: eq(designs.id, parseInt(req.params.id)),
      });
      if (!design) {
        return res.status(404).json({ error: "Design not found" });
      }
      res.json(design);
    } catch (error) {
      console.error("Failed to fetch design:", error);
      res.status(500).json({ error: "Failed to fetch design" });
    }
  });
}
