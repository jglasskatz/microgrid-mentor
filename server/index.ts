import express from "express";
import { setupVite, serveStatic } from "./vite";
import { createServer } from "http";
import { registerRoutes } from "./routes";

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(express.json());

// Register API routes
registerRoutes(app);

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// IIFE to handle async initialization
(async () => {
  try {
    // Setup Vite for development
    if (process.env.NODE_ENV !== "production") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Start server
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running at http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('Server initialization failed:', error);
    process.exit(1);
  }
})();
