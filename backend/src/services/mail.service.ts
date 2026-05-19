import nodemailer from "nodemailer";

interface SendPasswordResetEmailParams {
  to: string;
  name: string;
  resetToken: string;
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

export const sendPasswordResetEmail = async ({ to, name, resetToken }: SendPasswordResetEmailParams) => {
  const resetUrl = `${getFrontendUrl()}/reset-password?token=${encodeURIComponent(resetToken)}`;
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "ViMeet <no-reply@vimeet.local>";

  await getTransporter().sendMail({
    from,
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
