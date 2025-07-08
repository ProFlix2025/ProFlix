import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes";
import { setupVite, log } from "./vite";
import { validateEnvironment } from "./middleware/validation";
import { securityHeaders } from "./middleware/security";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Add health check endpoint for Render deployment
  app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'undefined'
    });
  });

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  const isDevelopment = process.env.NODE_ENV === "development";
  
  if (isDevelopment) {
    await setupVite(app, server);
  } else {
    // Serve production Vite build (static assets)
    console.log(`Serving static files from: ${path.join(__dirname, 'public')}`);
    app.use(express.static(path.join(__dirname, 'public')));
    
    // Handle client-side routing (history fallback)
    app.get('*', (req, res) => {
      console.log(`Serving SPA fallback for: ${req.path}`);
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
  }

  // Use PORT environment variable for production deployment (Render, etc.)
  const port = process.env.PORT ? parseInt(process.env.PORT) : (isDevelopment ? 5000 : 3000);
  
  console.log(`Starting ProFlix server...`);
  console.log(`Port: ${port} (from ${process.env.PORT ? 'Render' : 'default'})`);
  console.log(`Environment: ${process.env.NODE_ENV || 'undefined'}`);
  console.log(`Static files: ${path.join(__dirname, './public')}`);
  console.log(`Database URL: ${process.env.DATABASE_URL ? 'SET' : 'MISSING'}`);
  
  server.listen(port, "0.0.0.0", () => {
    console.log(`✅ ProFlix server successfully running on port ${port}`);
    console.log(`✅ Ready to accept connections at 0.0.0.0:${port}`);
    log(`serving on port ${port}`);
  }).on('error', (err) => {
    console.error('❌ Server startup failed:', err);
    console.error('❌ Error details:', {
      code: err.code,
      port: port,
      message: err.message,
      errno: err.errno
    });
    
    if (err.code === 'EADDRINUSE') {
      console.error('❌ Port already in use - this should not happen on Render');
    }
    
    process.exit(1);
  });
})();
