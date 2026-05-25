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

interface SendMeetingReminderEmailParams {
  to: string;
  name: string;
  meetingTitle: string;
  startTime: string;
  meetingUrl: string;
}

export const sendMeetingReminderEmail = async ({
  to,
  name,
  meetingTitle,
  startTime,
  meetingUrl,
}: SendMeetingReminderEmailParams) => {
  await getTransporter().sendMail({
    from: getMailFrom(),
    to,
    subject: `[Nhắc hẹn] Cuộc họp sắp diễn ra: ${meetingTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
        <h2 style="color: #0b55d9;">Nhắc lịch họp trên ViMeet</h2>
        <p>Xin chào ${name},</p>
        <p>Đây là thông báo nhắc nhở cuộc họp <strong>${meetingTitle}</strong> của bạn sẽ bắt đầu vào lúc <strong>${startTime}</strong>.</p>
        <p>
          <a href="${meetingUrl}" style="display: inline-block; background: #0b55d9; color: white; padding: 12px 18px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Vào Phòng Chờ
          </a>
        </p>
        <p>Chúc bạn có một buổi họp hiệu quả!</p>
        <p>Đội ngũ ViMeet</p>
      </div>
    `,
  });
};

interface SendUpgradeProEmailParams {
  email: string;
  name: string;
  expireTime: Date;
}

export const sendUpgradeProEmail = async ({
  email,
  name,
  expireTime,
}: SendUpgradeProEmailParams) => {
  await getTransporter().sendMail({
    from: getMailFrom(),
    to: email,
    subject: "[ViMeet] Bạn đã nâng cấp gói Pro thành công",
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
        <h2 style="color: #0b55d9;">Nâng cấp gói Pro thành công 🎉</h2>
        <p>Xin chào ${name},</p>
        <p>Bạn đã kích hoạt thành công gói <strong>Pro</strong> (dùng thử 1 ngày) trên ViMeet.</p>
        <p><strong>Thời hạn:</strong> đến ${expireTime.toLocaleString("vi-VN")}</p>
        <p>Quyền lợi Pro hiện tại của bạn đã được cập nhật:</p>
        <ul>
          <li><strong>200GB lưu trữ Cloud</strong> (Nâng cấp từ 2GB)</li>
          <li><strong>Tối đa 500 thành viên / Workspace</strong> (Nâng cấp từ 50)</li>
          <li>Tạo Workspace không giới hạn</li>
          <li>Tóm tắt AI trong lịch sử cuộc họp</li>
        </ul>
        <p>Các Workspace do bạn làm chủ đã được tự động nâng cấp lên gói Pro.</p>
        <p>Cảm ơn bạn đã sử dụng ViMeet.</p>
      </div>
    `,
  });
};

interface SendSubscriptionExpiredEmailParams {
  email: string;
  name: string;
}

export const sendSubscriptionExpiredEmail = async ({
  email,
  name,
}: SendSubscriptionExpiredEmailParams) => {
  await getTransporter().sendMail({
    from: getMailFrom(),
    to: email,
    subject: "[ViMeet] Gói Pro của bạn đã hết hạn",
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
        <h2 style="color: #d32f2f;">Gói Pro đã hết hạn</h2>
        <p>Xin chào ${name},</p>
        <p>Gói Pro của bạn đã hết hạn. Hệ thống đã tự động chuyển tài khoản về gói <strong>Free</strong>.</p>
        <p>Giới hạn hiện tại:</p>
        <ul>
          <li>2GB lưu trữ Cloud / Workspace</li>
          <li>Tối đa 50 thành viên / Workspace</li>
        </ul>
        <p>Bạn có thể nâng cấp lại bất cứ lúc nào.</p>
      </div>
    `,
  });
};
