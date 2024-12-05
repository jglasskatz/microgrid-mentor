import type { Express } from "express";
import { handleAICoach } from "./ai-coach";
import { db } from "db";
import { designs } from "db/schema";
import { desc, eq } from "drizzle-orm";

// Sample product data - in a real app, this would come from a database
const products = [
  {
    id: "1",
    name: "Solar Panel 400W",
    description: "High-efficiency monocrystalline solar panel",
    price: 299.99,
    type: "solar",
    specs: { power: 400, efficiency: 0.21 },
  },
  {
    id: "2",
    name: "Solar Panel 200W",
    description: "Mid-range monocrystalline solar panel",
    price: 159.99,
    type: "solar",
    specs: { power: 200, efficiency: 0.20 },
  },
  {
    id: "3",
    name: "Lithium Battery 5kWh",
    description: "Deep cycle lithium battery for energy storage",
    price: 3499.99,
    type: "battery",
    specs: { capacity: 5000, voltage: 48 },
  },
  {
    id: "4",
    name: "Battery 100Ah",
    description: "12V deep cycle battery",
    price: 899.99,
    type: "battery",
    specs: { capacity: 1200, voltage: 12 },
  },
  {
    id: "5",
    name: "LED Light Package",
    description: "Energy-efficient LED lighting system",
    price: 79.99,
    type: "load",
    specs: { power: 60, name: "Lights" },
  },
  {
    id: "6",
    name: "Energy Star Fridge",
    description: "Energy-efficient refrigerator",
    price: 899.99,
    type: "load",
    specs: { power: 500, name: "Fridge" },
  },
];

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
  app.get("/api/products/search", (req, res) => {
    try {
      const { type, ...specs } = req.query;
      console.log('Search request:', { type, specs });
      
      let filteredProducts = products;
      
      if (type) {
        filteredProducts = filteredProducts.filter(p => p.type === type);
        console.log('After type filter:', filteredProducts.length, 'products');
      }
      
      // Only apply specs filter if there are specs
      if (Object.keys(specs).length > 0) {
        filteredProducts = filteredProducts.filter(product => {
          return Object.entries(specs).every(([key, value]) => {
            console.log('Checking spec:', key, value, 'for product:', product.name);
            
            if (key.endsWith('_min')) {
              const baseKey = key.replace('_min', '');
              const specValue = Number(product.specs[baseKey]);
              const minValue = Number(value);
              console.log('Min check:', baseKey, specValue, '>=', minValue);
              return !isNaN(specValue) && !isNaN(minValue) && specValue >= minValue;
            }
            if (key.endsWith('_max')) {
              const baseKey = key.replace('_max', '');
              const specValue = Number(product.specs[baseKey]);
              const maxValue = Number(value);
              console.log('Max check:', baseKey, specValue, '<=', maxValue);
              return !isNaN(specValue) && !isNaN(maxValue) && specValue <= maxValue;
            }
            // For exact matches
            return product.specs[key]?.toString() === value?.toString();
          });
        });
        console.log('After specs filter:', filteredProducts.length, 'products');
      }
      
      console.log('Final results:', filteredProducts);
      res.json(filteredProducts);
    } catch (error) {
      console.error("Product search error:", error);
      res.status(500).json({ error: "Failed to search products" });
    }
  });

  // Single product endpoint
  app.get("/api/products/:id", (req, res) => {
    try {
      const product = products.find(p => p.id === req.params.id);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      // Find alternative products of the same type
      const alternatives = products.filter(p => 
        p.type === product.type && p.id !== product.id
      );
      
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
