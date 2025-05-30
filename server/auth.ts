import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import jwt from "jsonwebtoken";
const { decode, sign, verify } = jwt;

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const JWT_SECRET = process.env.JWT_SECRET || "intellaone-dev-secret-key";
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "intellaone-session-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 86400000, // 24 hours
      secure: process.env.NODE_ENV === "production",
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Local strategy for username/password authentication
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }

        if (await comparePasswords(password, user.password)) {
          return done(null, user);
        } else {
          return done(null, false, { message: "Incorrect password" });
        }
      } catch (err) {
        return done(err);
      }
    })
  );

  // Google OAuth strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    const callbackURL =
      process.env.NODE_ENV === "production"
        ? "https://your-domain.com/api/auth/google/callback"
        : "http://localhost:5050/api/auth/google/callback";

    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL,
          scope: ["profile", "email"],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user already exists with this Google ID
            let user = await storage.getUserByGoogleId(profile.id);

            if (!user) {
              // Check if user exists with same email
              const email =
                profile.emails && profile.emails[0]
                  ? profile.emails[0].value
                  : "";
              if (email) {
                user = await storage.getUserByEmail(email);
              }

              if (user) {
                // Update existing user with Google ID
                user = await storage.updateUser(user.id, {
                  googleId: profile.id,
                  authMethod: "google",
                  avatarUrl:
                    user.avatarUrl ||
                    (profile.photos && profile.photos[0]
                      ? profile.photos[0].value
                      : null),
                });
              } else {
                // Create new user from Google profile
                const name =
                  profile.displayName ||
                  (profile.name
                    ? `${profile.name.givenName} ${profile.name.familyName}`
                    : "Google User");
                user = await storage.createUser({
                  email: email || `google-user-${profile.id}@example.com`,
                  fullName: name,
                  googleId: profile.id,
                  authMethod: "google",
                  avatarUrl:
                    profile.photos && profile.photos[0]
                      ? profile.photos[0].value
                      : null,
                  role: "marketer", // Default role
                });
              }
            }

            return done(null, user);
          } catch (err) {
            return done(err);
          }
        }
      )
    );
  } else {
    console.warn(
      "Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable it."
    );
  }

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Register endpoint
  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Create new user with hashed password
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      // Log in the user automatically
      req.login(user, (err) => {
        if (err) return next(err);

        // Create JWT token
        const token = sign({ id: user.id, role: user.role }, JWT_SECRET, {
          expiresIn: "24h",
        });

        res.status(201).json({
          user: userWithoutPassword,
          token,
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Server error during registration" });
    }
  });

  // Login endpoint
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res
          .status(401)
          .json({ message: info?.message || "Authentication failed" });
      }

      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);

        // Create JWT token
        const token = sign({ id: user.id, role: user.role }, JWT_SECRET, {
          expiresIn: "24h",
        });

        // Remove password from response
        const { password, ...userWithoutPassword } = user;

        res.status(200).json({
          user: userWithoutPassword,
          token,
        });
      });
    })(req, res, next);
  });

  // Logout endpoint
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  // Get current user endpoint
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });

  // Google OAuth routes
  app.get(
    "/api/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/auth?error=google-auth-failed",
    }),
    (req, res) => {
      // Create JWT token for client-side auth
      const token = sign({ id: req.user.id, role: req.user.role }, JWT_SECRET, {
        expiresIn: "24h",
      });

      // Redirect to front-end with token
      res.redirect(`/?token=${token}`);
    }
  );
}
