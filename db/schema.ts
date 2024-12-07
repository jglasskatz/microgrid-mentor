import { pgTable, text, integer, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const designs = pgTable("designs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  components: jsonb("components").notNull().$type<{
    id: string;
    type: string;
    x: number;
    y: number;
    connections: string[];
    specs: Record<string, number | string>;
  }[]>(),
  created_at: text("created_at").notNull().default("NOW()"),
});

export const products = pgTable("products", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price").notNull(),
  type: text("type").notNull(),
  specs: jsonb("specs").notNull().$type<Record<string, number | string>>(),
});

export const insertDesignSchema = createInsertSchema(designs);
export const selectDesignSchema = createSelectSchema(designs);
export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);

export type InsertDesign = z.infer<typeof insertDesignSchema>;
export type Design = z.infer<typeof selectDesignSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = z.infer<typeof selectProductSchema>;