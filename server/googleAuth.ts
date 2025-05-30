import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Express } from "express";
import { storage } from "./storage";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CALLBACK_URL = process.env.CALLBACK_URL;
const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-key";

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists by email
        let user = await storage.getUserByEmail(
          profile.emails?.[0]?.value || ""
        );

        console.log("user", user);

        if (!user) {
          // Create new user if doesn't exist
          user = await storage.createUser({
            email: profile.emails?.[0]?.value || "",
            fullName: profile.displayName,
            username:
              profile.emails?.[0]?.value?.split("@")[0] || `user-${Date.now()}`,
            password: "google-oauth", // Placeholder as Google handles auth
            authMethod: "google",
            role: "marketer", // Default role
            avatarUrl: profile.photos?.[0]?.value || null,
            googleId: profile.id, // Store Google ID
          });
          console.log("new user", user);
        } else if (user.authMethod !== "google") {
          // Update existing user with Google info
          user = await storage.updateUser(user.id, {
            authMethod: "google",
            avatarUrl: user.avatarUrl || profile.photos?.[0]?.value || null,
            googleId: profile.id, // Store Google ID
          });
        }

        return done(null, user);
      } catch (error) {
        console.error("Google OAuth error:", error);
        return done(error as Error);
      }
    }
  )
);

// Serialize user for the session
passport.serializeUser((user: any, done) => {
  // Store user id in session
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    console.error("Deserialize user error:", error);
    done(error);
  }
});

// Generate JWT token
const generateToken = (user: any) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
};

// Setup Google Auth routes
export function setupGoogleAuth(app: Express) {
  // Google OAuth login route
  app.get(
    "/api/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
      prompt: "select_account", // Force Google to show account selection
    })
  );

  // Google OAuth callback route
  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/auth",
      failureMessage: true,
    }),
    (req, res) => {
      const user = req.user as any;
      const token = generateToken(user);

      // Redirect to frontend with token
      res.redirect(`/agents?token=${token}`);
    }
  );

  // Get current user route
  app.get("/api/auth/user", (req, res) => {
    if (req.isAuthenticated()) {
      const { password, ...userWithoutPassword } = req.user as any;
      res.json(userWithoutPassword);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Logout route
  app.get("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.json({ message: "Logged out successfully" });
    });
  });
}

// Middleware to check if user is authenticated
export const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
};
