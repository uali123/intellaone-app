import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seed";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { setupGoogleAuth } from "./googleAuth";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// Configure CORS with specific origin for your Firebase-hosted frontend
const corsOptions = {
  origin: true,
  // origin: ["http://localhost:5050", "https://intellaone-hosting.web.app"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "x-free-trial"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400, // 24 hours in seconds - how long preflight requests can be cached
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Force CORS headers on all responses to ensure consistent handling
app.use((req, res, next) => {
  // Log all incoming requests and origins for debugging
  console.log(
    `[CORS] ${req.method} request from origin: ${
      req.headers.origin || "unknown"
    } to ${req.url}`
  );

  const ALLOWED_ORIGINS = [
    "https://intellaone-hosting.web.app",
    "https://intellaone-api.onrender.com",
    "http://localhost:3000",
    "http://localhost:5050",
  ];

  const origin = req.headers.origin;

  // Set CORS headers based on origin
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    console.log(`[CORS] Allowing request from origin: ${origin}`);
  } else if (process.env.NODE_ENV !== "production") {
    // In development, allow any origin
    res.header("Access-Control-Allow-Origin", origin || "*");
    console.log(`[CORS] Development mode - allowing origin: ${origin || "*"}`);
  } else {
    console.log(
      `[CORS] Blocking request from unauthorized origin: ${origin || "unknown"}`
    );
  }

  // Set comprehensive CORS headers for all environments
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-free-trial"
  );
  res.header("Access-Control-Max-Age", "86400"); // 24 hours in seconds
  res.header("Access-Control-Allow-Credentials", "true");

  // Respond immediately to OPTIONS requests
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
});

// Handle OPTIONS requests explicitly for all routes
app.options("*", (req, res) => {
  const ALLOWED_ORIGINS = [
    "https://intellaone-hosting.web.app",
    "https://intellaone-api.onrender.com",
    "http://localhost:3000",
    "http://localhost:5050",
  ];

  const origin = req.headers.origin;

  // Set CORS headers based on origin for OPTIONS requests
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    console.log(`[CORS] OPTIONS: Allowing preflight from origin: ${origin}`);
  } else if (process.env.NODE_ENV !== "production") {
    // In development, allow any origin
    res.header("Access-Control-Allow-Origin", origin || "*");
    console.log(
      `[CORS] OPTIONS: Development mode - allowing preflight from: ${
        origin || "*"
      }`
    );
  } else {
    console.log(
      `[CORS] OPTIONS: Blocking preflight from unauthorized origin: ${
        origin || "unknown"
      }`
    );
  }

  // Set comprehensive CORS headers for preflight
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-free-trial"
  );
  res.header("Access-Control-Max-Age", "86400"); // 24 hours in seconds
  res.header("Access-Control-Allow-Credentials", "true");
  res.status(204).end();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration - must be before passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      sameSite: "lax", // Add sameSite attribute for better security
    },
  })
);

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Setup Google OAuth routes

// Setup Google OAuth
setupGoogleAuth(app);

// Request logging middleware
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
  // Seed the database with initial data
  await seedDatabase();

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
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = process.env.PORT;
  console.log("ENV", process.env.NODE_ENV);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    }
  );
})();
