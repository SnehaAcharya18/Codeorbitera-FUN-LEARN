import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465, // Use SSL/TLS for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sender = {
  email: process.env.SMTP_FROM_EMAIL || "hello@yourapp.com",
  name: process.env.SMTP_FROM_NAME || "Your App Team",
};