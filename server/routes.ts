import type { Express } from "express";
import { handleAICoach } from "./ai-coach";
import { db } from "db";
import { designs } from "db/schema";
import { desc, eq, and, ne } from "drizzle-orm";

import { products } from "db/schema";

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

  // Product search endpoint
  app.get("/api/products/search", async (req, res) => {
    try {
      const { type, ...specs } = req.query;
      console.log('Search request:', { type, specs });
      
      let query = db.select().from(products);
      
      if (type) {
        query = query.where(eq(products.type, type.toString()));
      }
      
      const results = await query;
      let filteredProducts = results;
      
      // Only apply specs filter if there are specs
      if (Object.keys(specs).length > 0) {
        filteredProducts = results.filter(product => {
          return Object.entries(specs).every(([key, value]) => {
            if (key.endsWith('_min')) {
              const baseKey = key.replace('_min', '');
              const specValue = Number(product.specs[baseKey]);
              const minValue = Number(value);
              return !isNaN(specValue) && !isNaN(minValue) && specValue >= minValue;
            }
            if (key.endsWith('_max')) {
              const baseKey = key.replace('_max', '');
              const specValue = Number(product.specs[baseKey]);
              const maxValue = Number(value);
              return !isNaN(specValue) && !isNaN(maxValue) && specValue <= maxValue;
            }
            return product.specs[key]?.toString() === value?.toString();
          });
        });
      }
      
      res.json(filteredProducts);
    } catch (error) {
      console.error("Product search error:", error);
      res.status(500).json({ error: "Failed to search products" });
    }
  });

  // Single product endpoint
  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await db.query.products.findFirst({
        where: eq(products.id, parseInt(req.params.id)),
      });
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      // Find alternative products of the same type
      const alternatives = await db.select()
        .from(products)
        .where(and(
          eq(products.type, product.type),
          ne(products.id, product.id)
        ));
      
      res.json({
        ...product,
        alternatives
      });
    } catch (error) {
      console.error("Product fetch error:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });
}
