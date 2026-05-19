import nodemailer from "nodemailer";

interface SendPasswordResetEmailParams {
  to: string;
  name: string;
  resetToken: string;
}

interface SendEmailVerificationParams {
  to: string;
  name: string;
  verificationToken: string;
}

const requiredEnv = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Thieu bien moi truong ${name} de gui email`);
  }

  return value;
};

const getTransporter = () => {
  const port = Number(process.env.SMTP_PORT || 587);

  return nodemailer.createTransport({
    host: requiredEnv("SMTP_HOST"),
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    auth: {
      user: requiredEnv("SMTP_USER"),
      pass: requiredEnv("SMTP_PASS"),
    },
  });
};

const getFrontendUrl = () => process.env.FRONTEND_URL || "http://localhost:3000";

const getMailFrom = () => process.env.SMTP_FROM || process.env.SMTP_USER || "ViMeet <no-reply@vimeet.local>";

export const sendPasswordResetEmail = async ({ to, name, resetToken }: SendPasswordResetEmailParams) => {
  const resetUrl = `${getFrontendUrl()}/reset-password?token=${encodeURIComponent(resetToken)}`;

  await getTransporter().sendMail({
    from: getMailFrom(),
    to,
    subject: "Reset your ViMeet password",
    text: [
      `Hi ${name},`,
      "",
      "We received a request to reset your ViMeet password.",
      `Open this link to create a new password: ${resetUrl}`,
      "",
      "This link expires in 15 minutes. If you did not request this, you can ignore this email.",
      "",
      "ViMeet Team",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
        <h2 style="color: #0b55d9;">Reset your ViMeet password</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your ViMeet password.</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; background: #0b55d9; color: white; padding: 12px 18px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Create New Password
          </a>
        </p>
        <p>This link expires in 15 minutes. If you did not request this, you can ignore this email.</p>
        <p>ViMeet Team</p>
      </div>
    `,
  });
};

export const sendEmailVerificationEmail = async ({ to, name, verificationToken }: SendEmailVerificationParams) => {
  const verifyUrl = `${getFrontendUrl()}/verify-email?token=${encodeURIComponent(verificationToken)}`;

  await getTransporter().sendMail({
    from: getMailFrom(),
    to,
    subject: "Verify your ViMeet account",
    text: [
      `Hi ${name},`,
      "",
      "Welcome to ViMeet. Please verify your email address before signing in.",
      `Open this link to verify your account: ${verifyUrl}`,
      "",
      "This link expires in 24 hours.",
      "",
      "ViMeet Team",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
        <h2 style="color: #0b55d9;">Verify your ViMeet account</h2>
        <p>Hi ${name},</p>
        <p>Welcome to ViMeet. Please verify your email address before signing in.</p>
        <p>
          <a href="${verifyUrl}" style="display: inline-block; background: #0b55d9; color: white; padding: 12px 18px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Verify Email
          </a>
        </p>
        <p>This link expires in 24 hours.</p>
        <p>ViMeet Team</p>
      </div>
    `,
  });
};
