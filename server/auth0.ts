import { auth } from "express-openid-connect";
import { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";

/**
 * Set up Auth0 authentication for the application
 */
export function setupAuth0(app: Express) {
  // Auth0 configuration
  // Check for required auth0 environment variables
  if (
    !process.env.AUTH0_ISSUER_BASE_URL ||
    !process.env.AUTH0_CLIENT_ID ||
    !process.env.AUTH0_CLIENT_SECRET
  ) {
    throw new Error(
      "Auth0 credentials not properly configured. Make sure AUTH0_ISSUER_BASE_URL, AUTH0_CLIENT_ID, and AUTH0_CLIENT_SECRET are set."
    );
  }

  // Get the base URL for the application
  // In production, this would be the deployed URL
  // In development, we use the Replit URL
  const getBaseUrl = () => {
    if (process.env.BASE_URL) {
      return process.env.BASE_URL;
    }

    // For Replit environment
    if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
      return `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
    }

    // Localhost fallback
    return "http://localhost:5050";
  };

  const baseURL = getBaseUrl();
  console.log(`Auth0: Using base URL: ${baseURL}`);

  // Make sure the issuerBaseURL has the https:// prefix
  let issuerBaseURL = process.env.AUTH0_ISSUER_BASE_URL || "";
  if (issuerBaseURL && !issuerBaseURL.startsWith("http")) {
    issuerBaseURL = `https://${issuerBaseURL}`;
  }

  console.log(`Auth0: Using issuer URL: ${issuerBaseURL}`);

  const config = {
    authRequired: false,
    auth0Logout: true,
    secret:
      process.env.SESSION_SECRET ||
      "a-long-secret-value-for-auth0-session-management",
    baseURL: baseURL,
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: issuerBaseURL,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    routes: {
      callback: "/api/auth/callback",
      login: "/api/auth/login",
      logout: "/api/auth/logout",
    },
    authorizationParams: {
      response_type: "code",
      scope: "openid profile email",
    },
  };

  // Auth router setup
  app.use(auth(config));

  // Current user API endpoint
  app.get("/api/user", async (req: Request, res: Response) => {
    if (req.oidc.isAuthenticated()) {
      try {
        // Get the Auth0 user profile
        const auth0User = req.oidc.user;

        // Check if user exists in our database
        let user = await storage.getUserByEmail(auth0User?.email || "");

        if (!user) {
          // Create new user if they don't exist
          user = await storage.createUser({
            email: auth0User?.email || "auth0-user@example.com",
            fullName: auth0User?.name || "Auth0 User",
            username: auth0User?.nickname || `user-${Date.now()}`,
            // Auth0 handles passwords, so we can set a placeholder
            password: "auth0-managed",
            authMethod: "auth0",
            role: "marketer", // Default role
            avatarUrl: auth0User?.picture || null,
          });
        } else if (user.authMethod !== "auth0") {
          // Update existing user with Auth0 info
          user = await storage.updateUser(user.id, {
            authMethod: "auth0",
            avatarUrl: user.avatarUrl || auth0User?.picture || null,
          });
        }

        // Remove sensitive data before sending to client
        const { password, ...userWithoutPassword } = user;

        res.json(userWithoutPassword);
      } catch (error) {
        console.error("Error getting user data:", error);
        res.status(500).json({ error: "Failed to get user data" });
      }
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Authenticated middleware
  app.use("/api/protected", requireAuth, (req, res) => {
    res.json({ message: "This is a protected endpoint", user: req.oidc.user });
  });
}

/**
 * Middleware to require authentication
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.oidc.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}
