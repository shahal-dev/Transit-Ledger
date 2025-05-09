import dotenv from "dotenv";
dotenv.config();

import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual, createHash } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import rateLimit from "express-rate-limit";
import { sendVerificationEmail, sendWelcomeEmail } from "./email";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

// Hash a password for storage
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Compare supplied password with stored hashed password
async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Hash an NID number for privacy
export function hashNID(nid: string): string {
  return createHash('sha256').update(nid).digest('hex');
}

// Generate a verification code
function generateVerificationCode(): string {
  return randomBytes(3).toString("hex").toUpperCase();
}

export function setupAuth(app: Express) {
  // Rate limiter for login attempts
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: { message: "Too many login attempts, please try again after 15 minutes" },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "transitledger-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "lax",
      httpOnly: true,
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Set up the local strategy for authentication
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Register a new user
  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password, fullName, nidHash, phone, email } = req.body;

      // Validate required fields
      if (!username || !password || !fullName || !nidHash || !phone) {
        return res.status(400).json({ message: "All required fields must be provided" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        if (existingUser.verified) {
        return res.status(400).json({ message: "Username already exists" });
        }
        // If user exists but is not verified, delete the old user record
        await storage.deleteUser(existingUser.id);
      }

      // Check if NID is already registered
      const existingNID = await storage.getUserByNidHash(nidHash);
      if (existingNID) {
        if (existingNID.verified) {
        return res.status(400).json({ message: "This NID is already registered" });
        }
        // If NID exists but is not verified, delete the old user record
        await storage.deleteUser(existingNID.id);
      }

      // Create user with hashed password
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        fullName,
        nidHash,
        phone,
        email: email || null,
        verified: false
      });

      // Create a wallet for the user automatically
      await storage.createWallet({
        userId: user.id
      });

      // If email is provided, send verification email
      if (email) {
        const verificationCode = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
        
        // Create verification record
        await storage.createEmailVerification(
          user.id,
          email,
          verificationCode,
          expiresAt
        );

        // Send verification email with code and link
        const verificationLink = `${process.env.CLIENT_URL}/email-verification?code=${verificationCode}&userId=${user.id}`;
        await sendVerificationEmail(email, verificationCode, verificationLink);
      }

      // Return success without logging in
      res.status(201).json({
        message: "Registration successful. Please check your email to verify your account.",
        userId: user.id
      });
    } catch (error) {
      next(error);
    }
  });

  // Verify email
  app.post("/api/verify-email", async (req, res, next) => {
    try {
      const { userId, code } = req.body;

      if (!userId || !code) {
        return res.status(400).json({ message: "User ID and verification code are required" });
      }

      // Get the verification record
      const verification = await storage.getEmailVerification(userId);
      
      if (!verification) {
        return res.status(404).json({ message: "No verification found" });
      }

      if (verification.verified) {
        return res.status(400).json({ message: "Email already verified" });
      }

      if (verification.expiresAt < new Date()) {
        return res.status(400).json({ message: "Verification code has expired" });
      }

      if (verification.verificationCode !== code) {
        return res.status(400).json({ message: "Invalid verification code" });
      }

      // Verify the email
      await storage.verifyEmail(userId);

      // Update user's verified status
      const user = await storage.verifyUser(userId);

      res.json({ message: "Email verified successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Resend verification email
  app.post("/api/resend-verification", async (req, res, next) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // Use getUser instead of getUserById
      const user = await storage.getUser(parseInt(userId));
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.email) {
        return res.status(400).json({ message: "No email address found" });
      }

      if (user.verified) {
        return res.status(400).json({ message: "Email already verified" });
      }

      const verificationCode = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
      
      // Create new verification record
      await storage.createEmailVerification(
        user.id,
        user.email,
        verificationCode,
        expiresAt
      );

      // Send verification email with code and link
      const verificationLink = `${process.env.CLIENT_URL}/email-verification?code=${verificationCode}&userId=${user.id}`;
      await sendVerificationEmail(user.email, verificationCode, verificationLink);

      res.json({ message: "Verification email sent" });
    } catch (error) {
      next(error);
    }
  });

  // Login with rate limiting
  app.post("/api/login", loginLimiter, async (req, res, next) => {
    try {
      const { username, password } = req.body;

      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Check if user is verified
      if (!user.verified) {
        return res.status(403).json({ 
          message: "Please verify your email before logging in",
          userId: user.id
        });
      }

      // Verify password
      if (!(await comparePasswords(password, user.password))) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Log the user in
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Set session cookie maxAge based on remember me
        if (req.body.rememberMe) {
          req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        } else {
          req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 1 day
        }
        
        // Don't send the password in the response
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  // Logout
  app.post("/api/logout", (req, res, next) => {
    // Destroy the session
    req.session.destroy((err) => {
      if (err) return next(err);
      
      // Clear the session cookie
      res.clearCookie('connect.sid', {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/"
      });
      
      res.sendStatus(200);
    });
  });

  // Get current user
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    // Don't send the password in the response
    const { password, ...userWithoutPassword } = req.user as SelectUser;
    res.json(userWithoutPassword);
  });

  // Submit verification details
  app.post("/api/verify/submit", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      const { nidNumber, passportNumber, dateOfBirth, address } = req.body;
      const userId = (req.user as SelectUser).id;
      
      // Check if verification already exists
      const existingVerification = await storage.getVerificationByUserId(userId);
      if (existingVerification) {
        return res.status(400).json({ message: "Verification already submitted" });
      }
      
      // Create new verification record
      const verification = await storage.createVerification({
        userId,
        nidNumber,
        passportNumber: passportNumber || null,
        dateOfBirth,
        address
      });
      
      res.status(201).json(verification);
    } catch (error) {
      next(error);
    }
  });

  // Get verification status
  app.get("/api/verify/status", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
      
      const userId = (req.user as SelectUser).id;
      const verification = await storage.getVerificationByUserId(userId);
      
      if (!verification) {
        return res.status(404).json({ message: "No verification found" });
      }
      
      res.status(200).json(verification);
    } catch (error) {
      next(error);
    }
  });
}
