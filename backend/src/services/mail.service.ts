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
    throw new Error(`Missing ${name} environment variable for email delivery`);
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
  const resetUrl = `${getFrontendUrl()}/reset-password#token=${encodeURIComponent(resetToken)}`;

  await getTransporter().sendMail({
    from: getMailFrom(),
    to,
    subject: "Đặt lại mật khẩu ViMeet của bạn",
    text: [
      `Xin chào ${name},`,
      "",
      "Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu ViMeet của bạn.",
      `Vui lòng truy cập liên kết sau để tạo mật khẩu mới: ${resetUrl}`,
      "",
      "Liên kết này sẽ hết hạn trong 15 phút. Nếu bạn không yêu cầu đặt lại mật khẩu, bạn có thể bỏ qua email này.",
      "",
      "Đội ngũ ViMeet",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
        <h2 style="color: #0b55d9;">Đặt lại mật khẩu ViMeet của bạn</h2>
        <p>Xin chào ${name},</p>
        <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu ViMeet của bạn.</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; background: #0b55d9; color: white; padding: 12px 18px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Tạo Mật Khẩu Mới
          </a>
        </p>
        <p>Liên kết này sẽ hết hạn trong 15 phút. Nếu bạn không yêu cầu đặt lại mật khẩu, bạn có thể bỏ qua email này.</p>
        <p>Đội ngũ ViMeet</p>
      </div>
    `,
  });
};

export const sendEmailVerificationEmail = async ({ to, name, verificationToken }: SendEmailVerificationParams) => {
  const verifyUrl = `${getFrontendUrl()}/verify-email#token=${encodeURIComponent(verificationToken)}`;

  await getTransporter().sendMail({
    from: getMailFrom(),
    to,
    subject: "Xác thực tài khoản ViMeet của bạn",
    text: [
      `Xin chào ${name},`,
      "",
      "Chào mừng bạn đến với ViMeet. Vui lòng xác thực địa chỉ email của bạn trước khi đăng nhập.",
      `Truy cập liên kết sau để xác thực tài khoản của bạn: ${verifyUrl}`,
      "",
      "Liên kết này sẽ hết hạn trong 24 giờ.",
      "",
      "Đội ngũ ViMeet",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
        <h2 style="color: #0b55d9;">Xác thực tài khoản ViMeet của bạn</h2>
        <p>Xin chào ${name},</p>
        <p>Chào mừng bạn đến với ViMeet. Vui lòng xác thực địa chỉ email của bạn trước khi đăng nhập.</p>
        <p>
          <a href="${verifyUrl}" style="display: inline-block; background: #0b55d9; color: white; padding: 12px 18px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Xác Thực Email
          </a>
        </p>
        <p>Liên kết này sẽ hết hạn trong 24 giờ.</p>
        <p>Đội ngũ ViMeet</p>
      </div>
    `,
  });
};

interface SendWorkspaceAddedEmailParams {
  to: string;
  name: string;
  workspaceName: string;
  workspaceUrl: string;
  inviterName?: string;
}

interface SendWorkspaceJoinRequestEmailParams {
  to: string;
  adminName: string;
  requesterName: string;
  requesterEmail: string;
  workspaceName: string;
  workspaceUrl: string;
}

interface SendWorkspaceJoinApprovedEmailParams {
  to: string;
  name: string;
  workspaceName: string;
  workspaceUrl: string;
  approverName?: string;
}

export const sendWorkspaceAddedEmail = async ({ to, name, workspaceName, workspaceUrl, inviterName }: SendWorkspaceAddedEmailParams) => {
  await getTransporter().sendMail({
    from: getMailFrom(),
    to,
    subject: `ViMeet | Bạn đã được thêm vào workspace: ${workspaceName}`,
    text: [
      `Xin chào ${name},`,
      "",
      `${inviterName ? `${inviterName} đã thêm bạn vào` : "Bạn đã được thêm vào"} Workspace: ${workspaceName} trên ViMeet.`,
      `Mở liên kết dưới đây để truy cập Workspace: ${workspaceUrl}`,
      "",
      "ViMeet Team",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
        <h2 style="color: #0b55d9;">Chào mừng đến với Workspace: ${workspaceName}</h2>
        <p>Xin chào ${name},</p>
        <p>${inviterName ? `<strong>${inviterName}</strong> đã thêm bạn vào` : "Bạn đã được thêm vào"} Workspace: <strong>${workspaceName}</strong> trên ViMeet.</p>
        <p>
          <a href="${workspaceUrl}" style="display: inline-block; background: #0b55d9; color: white; padding: 12px 18px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Truy Cập Workspace
          </a>
        </p>
        <p>Đội ngũ ViMeet</p>
      </div>
    `,
  });
};

export const sendWorkspaceJoinRequestEmail = async ({
  to,
  adminName,
  requesterName,
  requesterEmail,
  workspaceName,
  workspaceUrl,
}: SendWorkspaceJoinRequestEmailParams) => {
  await getTransporter().sendMail({
    from: getMailFrom(),
    to,
    subject: `ViMeet | Có yêu cầu tham gia workspace: ${workspaceName}`,
    text: [
      `Xin chào ${adminName},`,
      "",
      `${requesterName} (${requesterEmail}) vừa gửi yêu cầu tham gia Workspace: ${workspaceName}.`,
      `Vui lòng mở trang workspace để duyệt hoặc từ chối yêu cầu: ${workspaceUrl}`,
      "",
      "ViMeet Team",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
        <h2 style="color: #0b55d9;">Yêu cầu tham gia Workspace</h2>
        <p>Xin chào ${adminName},</p>
        <p><strong>${requesterName}</strong> (${requesterEmail}) vừa gửi yêu cầu tham gia Workspace: <strong>${workspaceName}</strong>.</p>
        <p>
          <a href="${workspaceUrl}" style="display: inline-block; background: #0b55d9; color: white; padding: 12px 18px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Xem Yêu Cầu
          </a>
        </p>
        <p>Đội ngũ ViMeet</p>
      </div>
    `,
  });
};

export const sendWorkspaceJoinApprovedEmail = async ({
  to,
  name,
  workspaceName,
  workspaceUrl,
  approverName,
}: SendWorkspaceJoinApprovedEmailParams) => {
  await getTransporter().sendMail({
    from: getMailFrom(),
    to,
    subject: `ViMeet | Yêu cầu tham gia ${workspaceName} đã được duyệt`,
    text: [
      `Xin chào ${name},`,
      "",
      `${approverName ? `${approverName} đã duyệt` : "Yêu cầu tham gia của bạn đã được duyệt cho"} Workspace: ${workspaceName}.`,
      `Bạn có thể truy cập workspace tại: ${workspaceUrl}`,
      "",
      "ViMeet Team",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
        <h2 style="color: #0b55d9;">Yêu cầu tham gia đã được duyệt</h2>
        <p>Xin chào ${name},</p>
        <p>${approverName ? `<strong>${approverName}</strong> đã duyệt` : "Yêu cầu tham gia của bạn đã được duyệt cho"} Workspace: <strong>${workspaceName}</strong>.</p>
        <p>
          <a href="${workspaceUrl}" style="display: inline-block; background: #0b55d9; color: white; padding: 12px 18px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Truy Cập Workspace
          </a>
        </p>
        <p>Đội ngũ ViMeet</p>
      </div>
    `,
  });
};
