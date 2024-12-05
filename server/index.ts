import express, { type Request, Response, NextFunction } from "express";
import { createProxyMiddleware } from 'http-proxy-middleware';
import { setupVite, serveStatic } from "./vite";
import { createServer } from "http";
import { registerRoutes } from "./routes";

// Create Express app
const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Error handler middleware
const errorHandler = (err: any, _req: Request, res: Response, next: NextFunction) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
  next(err);
};

// Create HTTP server
const server = createServer(app);
const PORT = process.env.PORT || 5000;

// IIFE to handle async initialization
(async () => {
  try {
    // Configure and mount API proxy middleware first
    const apiProxy = createProxyMiddleware({
      target: 'http://0.0.0.0:8000',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', // Remove /api prefix when forwarding
      },
      secure: false,
      logLevel: 'debug',
      onError: (err: Error, _req: Request, res: Response) => {
        console.error('Proxy Error:', err);
        res.status(503).json({ error: 'Service Unavailable', message: 'Backend service is not ready' });
      },
      onProxyReq: (proxyReq, req, _res) => {
        console.log(`Proxying ${req.method} ${req.url} to ${proxyReq.path}`);
      },
      onProxyRes: (proxyRes, req, _res) => {
        console.log(`Received ${proxyRes.statusCode} for ${req.method} ${req.url}`);
      }
    });

    app.use('/api', apiProxy);

    // Register routes
    registerRoutes(app);

    // Add error handling
    app.use(errorHandler);

    // Setup Vite for development
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Start the server
    server.listen(PORT, "0.0.0.0", () => {
      const formattedTime = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      console.log(`${formattedTime} [express] Server running at http://0.0.0.0:${PORT}`);
    }).on('error', (err: Error) => {
      console.error('Failed to start server:', err);
      process.exit(1);
    });

  } catch (error) {
    console.error('Server initialization failed:', error);
    process.exit(1);
  }
})();
