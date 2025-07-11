import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes";
import { setupVite, log } from "./vite";
import { validateEnvironment } from "./middleware/validation";
import { securityHeaders } from "./middleware/security";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'proflix-dev-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Cookie parser for admin sessions
app.use((req, res, next) => {
  const cookies = req.headers.cookie;
  if (cookies) {
    const parsed: { [key: string]: string } = {};
    cookies.split(';').forEach(cookie => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) {
        parsed[key] = decodeURIComponent(value);
      }
    });
    (req as any).cookies = parsed;
  }
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const requestPath = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (requestPath.startsWith("/api")) {
      let logLine = `${req.method} ${requestPath} ${res.statusCode} in ${duration}ms`;
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
  // Health check endpoint for Render
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "undefined",
    });
  });

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  const isDevelopment = process.env.NODE_ENV === "development";

  if (isDevelopment) {
    await setupVite(app, server);
  } else {
    console.log(`Serving static files from: ${path.join(__dirname, "public")}`);
    app.use(express.static(path.join(__dirname, "public")));

    // Only serve SPA fallback for non-API routes
    app.get("*", (req, res, next) => {
      if (req.path.startsWith('/api/')) {
        return next(); // Let API routes handle this
      }
      console.log(`Serving SPA fallback for: ${req.path}`);
      res.sendFile(path.join(__dirname, "public", "index.html"));
    });
    
    // Auto-initialize database in production after server starts
    setTimeout(async () => {
      try {
        console.log('🔄 Auto-initializing production database...');
        
        // Import and run database initialization directly
        const { initializeDatabase } = await import('./initDb');
        const dbSuccess = await initializeDatabase();
        
        if (dbSuccess) {
          console.log('✅ Database schema created');
          
          // Import and run category setup
          const { storage } = await import('./storage');
          
          // Check if categories already exist
          const existingCategories = await storage.getCategories();
          if (existingCategories.length === 0) {
            console.log('📋 Setting up categories...');
            await storage.initializeCategories();
            console.log('✅ Categories initialized');
            
            // Also initialize ProFlix Academy
            try {
              await storage.createProFlixAcademy();
              console.log('✅ ProFlix Academy initialized');
            } catch (error) {
              console.log('✅ ProFlix Academy already exists or error:', error.message);
            }
          } else {
            console.log('✅ Categories already exist:', existingCategories.length);
            
            // Check if emojis need to be added
            const firstCategory = existingCategories[0];
            if (!firstCategory.emoji) {
              console.log('🎨 Adding emojis to categories...');
              try {
                await storage.addMissingColumns();
                console.log('✅ Emojis added to categories');
              } catch (error) {
                console.log('⚠️ Error adding emojis:', error.message);
              }
            } else {
              console.log('✅ Categories already have emojis');
            }
          }
          
          console.log('✅ Production database fully initialized');
        } else {
          console.log('⚠️ Database schema creation failed');
        }
      } catch (error) {
        console.log('⚠️ Database auto-setup error:', error.message);
      }
    }, 3000); // Wait 3 seconds for server to fully start
  }

  const port = process.env.PORT ? parseInt(process.env.PORT) : isDevelopment ? 5000 : 3000;

  console.log(`Starting ProFlix server...`);
  console.log(`Port: ${port} (from ${process.env.PORT ? "Render" : "default"})`);
  console.log(`Environment: ${process.env.NODE_ENV || "undefined"}`);
  console.log(`Static files: ${path.join(__dirname, "./public")}`);
  console.log(`Database URL: ${process.env.DATABASE_URL ? "SET" : "MISSING"}`);

  server
    .listen(port, "0.0.0.0", () => {
      console.log(`✅ ProFlix server successfully running on port ${port}`);
      console.log(`✅ Ready to accept connections at 0.0.0.0:${port}`);
      log(`serving on port ${port}`);
    })
    .on("error", (err) => {
      console.error("❌ Server startup failed:", err);
      console.error("❌ Error details:", {
        code: err.code,
        port,
        message: err.message,
        errno: err.errno,
      });

      if (err.code === "EADDRINUSE") {
        console.error("❌ Port already in use - this should not happen on Render");
      }

      process.exit(1);
    });
})();
