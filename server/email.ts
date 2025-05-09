import nodemailer from "nodemailer";
import { renderFile } from "ejs";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Email templates directory
const templatesDir = path.join(__dirname, "templates");

// Send verification email
export async function sendVerificationEmail(email: string, verificationCode: string, verificationLink: string) {
  try {
    const html = await renderFile(path.join(templatesDir, "verification-email.ejs"), {
      verificationCode,
      verificationLink,
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || "TransitLedger <noreply@transitledger.com>",
      to: email,
      subject: "Verify your TransitLedger account",
      html,
    });

    return true;
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return false;
  }
}

// Send welcome email
export async function sendWelcomeEmail(email: string, fullName: string) {
  try {
    const html = await renderFile(path.join(templatesDir, "welcome-email.ejs"), {
      fullName,
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || "TransitLedger <noreply@transitledger.com>",
      to: email,
      subject: "Welcome to TransitLedger!",
      html,
    });

    return true;
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return false;
  }
} 