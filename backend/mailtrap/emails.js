import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplates.js";
import { transporter, sender } from "./email.config.js";

export const sendVerificationEmail = async (email, verificationToken) => {
  const mailOptions = {
    from: `"${sender.name}" <${sender.email}>`,
    to: email,
    subject: "Verify your email",
    html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully", info.messageId);
  } catch (error) {
    console.error(`Error sending verification email`, error);
    throw new Error(`Error sending verification email: ${error.message}`);
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: `"${sender.name}" <${sender.email}>`,
    to: email,
    subject: "Welcome to Our App!",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Our App</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(to right, #6a11cb, #8e2de2); padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
          <h1 style="color: white; margin: 0;">Welcome, ${name}!</h1>
        </div>

        <!-- Body -->
        <div style="background-color: #fdf9ff; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          <p style="color: #4b0082;">Hello ${name},</p>
          <p>Welcome to our app! We're thrilled to have you on board.</p>
          <p>Get started by exploring our features and let us know if you need any assistance.</p>
          <p>Best regards,<br><strong style="color:#6a11cb;">${sender.name}</strong></p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Welcome email sent successfully", info.messageId);
  } catch (error) {
    console.error(`Error sending welcome email`, error);
    throw new Error(`Error sending welcome email: ${error.message}`);
  }
};


export const sendPasswordResetEmail = async (email, resetURL) => {
  const mailOptions = {
    from: `"${sender.name}" <${sender.email}>`,
    to: email,
    subject: "Reset your password",
    html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent successfully", info.messageId);
  } catch (error) {
    console.error(`Error sending password reset email`, error);
    throw new Error(`Error sending password reset email: ${error.message}`);
  }
};

export const sendResetSuccessEmail = async (email) => {
  const mailOptions = {
    from: `"${sender.name}" <${sender.email}>`,
    to: email,
    subject: "Password Reset Successful",
    html: PASSWORD_RESET_SUCCESS_TEMPLATE,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset success email sent successfully", info.messageId);
  } catch (error) {
    console.error(`Error sending password reset success email`, error);
    throw new Error(`Error sending password reset success email: ${error.message}`);
  }
};