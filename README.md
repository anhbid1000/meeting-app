# ViMeet — Realtime Team Collaboration & Meeting Platform

ViMeet là nền tảng cộng tác nhóm theo mô hình **workspace → channel → conversation → meeting**, kết hợp nhắn tin realtime, chia sẻ file, quản lý thành viên và họp trực tuyến bằng LiveKit. Dự án được xây dựng theo mô hình full-stack với **Next.js frontend**, **Express/TypeScript backend**, **MongoDB**, **Socket.IO**, **LiveKit**, **Cloudinary** và AI meeting summary bằng Gemini API.

> Trạng thái hiện tại: project đã có các luồng chính cho authentication, workspace/channel collaboration, realtime chat, thread/reaction/mention, notification, file sharing, LiveKit meeting, meeting notes/chat, meeting history và AI-generated meeting summary.

---

## 1. Tính năng chính

### Authentication & User

- Đăng ký tài khoản bằng email/password.
- Xác thực email trước khi đăng nhập.
- Đăng nhập Google OAuth.
- Access token + refresh token rotation.
- Refresh token được lưu bằng HTTP-only cookie.
- Quên mật khẩu và reset password qua email.
- Rate limiting cho login, resend verification, forgot/reset password.
- Cập nhật profile người dùng.
- Tìm kiếm user theo keyword.

### Workspace

- Tạo và xem danh sách workspace người dùng tham gia.
- Workspace category và mô tả.
- Role theo workspace: `owner`, `admin`, `member`, `pending`.
- Mời thành viên trực tiếp khi tạo workspace.
- Tạo invite link/code cho workspace.
- Join workspace qua invite và chờ owner/admin approve.
- Quản lý thành viên và cập nhật role.
- Xóa workspace cùng dữ liệu liên quan.
- Free/Pro plan được lưu ở user/workspace để áp dụng quota.

### Channel Collaboration

- Tạo channel `public` hoặc `private` trong workspace.
- Channel directory theo workspace.
- Search/filter/sort channel.
- Join/leave channel.
- Request access vào private channel.
- Owner/admin approve hoặc reject join request.
- Archive và xóa channel.
- Favorite/mute channel theo user.
- Theo dõi unread count và mention count.
- Presence online/offline và typing indicator realtime.

### Realtime Chat

- Gửi và nhận message realtime bằng Socket.IO.
- Message được persist vào MongoDB trước khi broadcast.
- Cursor pagination cho lịch sử message.
- Edit và soft-delete message.
- Mention thành viên trong channel.
- Pin/unpin message.
- Emoji reaction.
- Thread conversation / reply.
- System message cho các sự kiện như join/leave channel, meeting start/end.
- Optimistic message UI phía frontend.

### Notification

- Notification được persist trong database.
- Realtime notification theo user room.
- Notification cho các sự kiện như:
  - mention,
  - thread reply,
  - join request,
  - request approved/rejected,
  - meeting started.
- Mark one / mark all as read.
- Theo dõi unread notification count.

### File Sharing

- Upload file theo workspace + channel.
- File được lưu trên Cloudinary.
- Metadata file được lưu trong MongoDB.
- Sau khi upload, hệ thống tự tạo message attachment trong channel.
- Xem danh sách file theo workspace.
- Lọc file/media/link theo channel.
- Theo dõi dung lượng workspace.
- Quota hiện tại trong backend:
  - Free: khoảng `2 GB` storage.
  - Pro: khoảng `20 GB` storage.

### Live Meeting

- Tạo meeting trong một workspace/channel.
- Instant meeting hoặc scheduled meeting.
- LiveKit server token generation.
- Pre-join lobby trước khi vào phòng.
- Camera/microphone preview.
- Liệt kê audio/video devices.
- Video participant grid.
- Bật/tắt camera và microphone.
- Screen sharing.
- Participant join/leave tracking.
- Auto-end meeting khi LiveKit room trống.
- Auto-end scheduled meeting quá hạn chưa có người vào.
- Email reminder cho scheduled meeting.

### Meeting Chat, Notes & AI Summary

- Chat trong meeting qua LiveKit data channel.
- Shared meeting notes realtime.
- Chat/note đồng thời được persist về backend.
- Snapshot meeting context khi cuộc họp kết thúc.
- Meeting history theo user/workspace/channel.
- AI summary từ chat + notes bằng Gemini Generative Language API.
- Structured summary bao gồm:
  - summary,
  - key points,
  - decisions,
  - action items,
  - risks/questions,
  - proposed next meeting agenda.

### Subscription / Product Limits

- User/workspace có `free` và `pro` plan.
- Endpoint Pro trial hiện nâng cấp trong `24 giờ`.
- Workspace member limit hiện tại:
  - Free: `50` thành viên.
  - Pro: `500` thành viên.
- Workspace do user sở hữu được đồng bộ plan khi upgrade/downgrade.

---

## 2. Tech Stack

### Backend

- Node.js
- TypeScript `6.x`
- Express `5.x`
- MongoDB + Mongoose `9.x`
- Socket.IO
- JSON Web Token
- bcryptjs
- Google Auth Library
- Zod validation
- Nodemailer
- Cloudinary SDK
- LiveKit Server SDK
- node-cron
- Multer
- Jest + Supertest
- mongodb-memory-server

### Frontend

- Next.js `16.x`
- React `19.x`
- TypeScript
- Tailwind CSS `4.x`
- TanStack React Query
- Zustand
- Axios
- Socket.IO Client
- LiveKit Client
- LiveKit React Components
- React Hook Form + Zod
- React Hot Toast
- Framer Motion
- date-fns

### External Services

- MongoDB / MongoDB Atlas
- LiveKit
- Cloudinary
- Google OAuth
- SMTP provider
- Gemini Generative Language API

---

## 3. Cấu trúc thư mục

```text
meeting-app/
├── backend/
│   ├── src/
│   │   ├── __tests__/              # Integration/API/socket tests
│   │   ├── config/                 # Cloudinary và app config
│   │   ├── controllers/            # HTTP request handlers
│   │   ├── dao/                    # Data access layer
│   │   ├── dtos/                   # Zod DTO / validation schema
│   │   ├── middlewares/            # Auth, permission, validation, upload...
│   │   ├── models/                 # Mongoose models
│   │   ├── routes/                 # REST API routes
│   │   ├── scripts/                # Cron jobs / utilities
│   │   ├── services/               # Business logic
│   │   ├── sockets/                # Socket.IO realtime handlers
│   │   ├── types/                  # Shared backend types
│   │   ├── utils/                  # Token, realtime bus, rate limit...
│   │   └── server.ts               # Express + HTTP + Socket.IO entrypoint
│   ├── seed-comprehensive.ts
│   ├── test-integration.ts
│   ├── jest.config.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/                    # Next.js App Router pages
│   │   │   ├── (dashboard)/        # Authenticated workspace UI
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   ├── reset-password/
│   │   │   ├── verify-email/
│   │   │   ├── pricing/
│   │   │   └── profile/
│   │   ├── components/             # Reusable UI + domain components
│   │   ├── hooks/                  # React Query / socket hooks
│   │   ├── lib/                    # Frontend helpers
│   │   ├── services/               # Axios APIs + socket client
│   │   ├── store/                  # Zustand stores
│   │   ├── types/                  # Frontend TypeScript types
│   │   └── utils/
│   ├── package.json
│   └── next.config.ts
├── .github/
│   └── workflows/
│       └── main.yml                # Current CI workflow
├── Module 3 - Checklist chi tiet.md
├── Module 3 - Ke hoach thuc hien va giai thich ky thuat.md
├── README_MODULE3.MD
├── STRUCTURE.md
└── README.md
```

---

## 4. Yêu cầu môi trường

Để chạy project local cần:

- Node.js `20+` khuyến nghị.
- npm.
- MongoDB local hoặc MongoDB Atlas.
- LiveKit project/server nếu cần sử dụng meeting.
- Cloudinary account nếu cần upload file.
- SMTP account nếu cần email verification/reset/reminder.
- Google OAuth Client ID nếu cần Google Sign-In.
- Gemini API key nếu cần AI meeting summary.

Project hiện **không có Docker Compose setup hoàn chỉnh** trong root repo, vì vậy cách chạy chính là khởi động frontend và backend riêng.

---

## 5. Biến môi trường

Repo hiện chưa có một `.env.example` hoàn chỉnh bao phủ toàn bộ integration. Khi chạy local, tạo biến môi trường cho backend và frontend theo các key mà code đang sử dụng.

### 5.1. Backend

Tạo file:

```text
backend/.env
```

Ví dụ cấu hình tối thiểu:

```env
# Server
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/vimeet

# JWT
JWT_ACCESS_SECRET=replace_with_a_long_random_access_secret
JWT_REFRESH_SECRET=replace_with_a_long_random_refresh_secret
# JWT_SECRET có thể được dùng làm fallback bởi một số utility/script cũ
JWT_SECRET=replace_with_a_long_random_fallback_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=ViMeet <your_email@gmail.com>

# Cloudinary
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME

# LiveKit
LIVEKIT_URL=wss://your-livekit-host
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_SECRET_KEY=your_livekit_api_secret

# AI meeting summary
LLM_API_KEY=your_gemini_api_key
LLM_MODEL=gemini-3-pro
```

> AI summary hiện gọi Google Generative Language API và controller đang target model endpoint `gemini-flash-latest`.

### 5.2. Frontend

Tạo file:

```text
frontend/.env.local
```

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# Chỉ dùng cho development helper nếu cần
# NEXT_PUBLIC_DEV_USERS=[...]
```

> Không commit `.env` hoặc `.env.local` chứa secret thật lên Git.

---

## 6. Chạy dự án local

Clone repository:

```bash
git clone https://github.com/anhbid1000/meeting-app.git
cd meeting-app
```

### 6.1. Chạy backend

```bash
cd backend
npm install
npm run dev
```

Backend mặc định chạy tại:

```text
http://localhost:5000
```

Base API:

```text
http://localhost:5000/api/v1
```

Build backend:

```bash
npm run build
```

Chạy production build:

```bash
npm run build
npm start
```

### 6.2. Chạy frontend

Mở terminal khác:

```bash
cd frontend
npm install
npm run dev
```

Frontend mặc định chạy tại:

```text
http://localhost:3000
```

Build frontend:

```bash
npm run build
```

Lint frontend:

```bash
npm run lint
```

---

## 7. API namespace chính

Backend mount toàn bộ REST API dưới:

```text
/api/v1
```

| Nhóm             | Prefix chính                                                                  | Mục đích                                                                     |
| ---------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Auth             | `/api/v1/auth`                                                                | Register, login, Google OAuth, verify email, refresh, logout, reset password |
| Users            | `/api/v1/users`                                                               | Profile, user search, subscription                                           |
| Workspaces       | `/api/v1/workspaces`                                                          | Workspace CRUD và member management                                          |
| Workspace Invite | `/api/v1/workspaces/:workspaceId/invites` / `/api/v1/workspace-invites/:code` | Invite/join workspace                                                        |
| Categories       | `/api/v1/categories`                                                          | Workspace categories                                                         |
| Channels         | `/api/v1/workspaces/:workspaceId/channels`                                    | Channel directory và CRUD                                                    |
| Channel Actions  | `/api/v1/channels/...`                                                        | Join/leave/request/member/read-state actions                                 |
| Messages         | `/api/v1/channels/:channelId/messages` / `/api/v1/messages/:messageId`        | Chat, edit/delete, reaction, pin                                             |
| Threads          | `/api/v1/messages/:messageId/...`                                             | Thread replies                                                               |
| Workspace Files  | `/api/v1/workspaces/:workspaceId/files`                                       | File metadata/upload/channel file views                                      |
| Meetings         | `/api/v1/workspaces/:workspaceId/channels/:channelId/meetings`                | Create meeting                                                               |
| Meeting Runtime  | `/api/v1/meetings`                                                            | Join/leave/end/history/notes/chat/summary                                    |
| Notifications    | `/api/v1/notifications`                                                       | Notification inbox/read state                                                |

---

## 8. Một số API quan trọng

### Authentication

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/google
POST /api/v1/auth/verify-email
POST /api/v1/auth/resend-verification
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
```

### Channel Chat

```text
GET    /api/v1/channels/:channelId/messages
POST   /api/v1/channels/:channelId/messages
GET    /api/v1/channels/:channelId/pinned
PATCH  /api/v1/messages/:messageId
DELETE /api/v1/messages/:messageId
PATCH  /api/v1/messages/:messageId/pin
PATCH  /api/v1/messages/:messageId/unpin
POST   /api/v1/messages/:messageId/reactions
DELETE /api/v1/messages/:messageId/reactions/:emoji
```

### Meeting

```text
POST  /api/v1/workspaces/:workspaceId/channels/:channelId/meetings
GET   /api/v1/meetings/my/today
GET   /api/v1/meetings/my/history
GET   /api/v1/meetings/:meetingId
GET   /api/v1/meetings/:meetingId/join
PATCH /api/v1/meetings/:meetingId/leave
PATCH /api/v1/meetings/:meetingId/end
POST  /api/v1/meetings/:meetingId/chat-log
POST  /api/v1/meetings/:meetingId/notes
POST  /api/v1/meetings/:meetingId/summary
```

### File

```text
GET  /api/v1/workspaces/:workspaceId/files
GET  /api/v1/workspaces/:workspaceId/files/:fileId
POST /api/v1/workspaces/:workspaceId/files/upload
GET  /api/v1/workspaces/:workspaceId/files/channel/:channelId/all
GET  /api/v1/workspaces/:workspaceId/files/channel/:channelId/media
GET  /api/v1/workspaces/:workspaceId/files/channel/:channelId/links
```

---

## 9. Frontend routes chính

Frontend sử dụng Next.js App Router.

| Route                  | Ý nghĩa                               |
| ---------------------- | ------------------------------------- |
| `/`                    | Landing/root page                     |
| `/login`               | Đăng nhập                             |
| `/register`            | Đăng ký                               |
| `/verify-email`        | Xác thực email                        |
| `/forgot-password`     | Quên mật khẩu                         |
| `/reset-password`      | Đặt lại mật khẩu                      |
| `/dashboard`           | Dashboard chính                       |
| `/groups`              | Danh sách workspace                   |
| `/groups/:workspaceId` | Chi tiết/quản lý workspace            |
| `/channels`            | Channel directory                     |
| `/channels/:channelId` | Realtime channel chat                 |
| `/files`               | Workspace file center                 |
| `/meetings`            | Pre-join lobby + LiveKit meeting room |
| `/history`             | Meeting history                       |
| `/history/:meetingId`  | Meeting detail/history                |
| `/subscription`        | Subscription management               |
| `/pricing`             | Pricing page                          |
| `/profile`             | User profile                          |

---

## 10. Kiến trúc backend

Luồng xử lý chính:

```text
Route
  -> Middleware
  -> Controller
  -> Service
  -> DAO / Mongoose Model
  -> MongoDB
```

Các lớp chính:

- `routes/`: khai báo endpoint.
- `middlewares/`: authentication, authorization, validation, upload.
- `controllers/`: HTTP request/response orchestration.
- `services/`: business logic.
- `dao/`: data-access logic cho các domain cần abstraction riêng.
- `models/`: Mongoose schema/model.
- `sockets/`: realtime Socket.IO handlers.
- `utils/realtime.ts`: application-level realtime event bus.

Một số domain model chính:

- User
- Workspace
- WorkspaceInvite
- AccessRequest
- Category
- Channel
- ChannelMember
- ChannelJoinRequest
- Message
- MessageReaction
- ThreadReply
- Notification
- FileAsset
- Meeting

---

## 11. Realtime architecture

Chat và collaboration sử dụng Socket.IO, nhưng state quan trọng vẫn được persist ở backend.

Luồng phổ biến:

```text
Client action
   -> Socket.IO / REST
   -> Service
   -> MongoDB persistence
   -> realtimeBus
   -> Socket.IO room
   -> Connected clients
```

Các realtime domain hiện có gồm:

- message new/update/delete,
- pin/unpin,
- reaction add/remove,
- thread reply,
- typing,
- presence,
- channel membership,
- join request,
- notification,
- meeting start/end,
- channel activity/unread updates.

Socket connection được authenticate bằng access token và user được join vào room dạng:

```text
user:{userId}
channel:{channelId}
```

---

## 12. Meeting architecture

Meeting sử dụng LiveKit cho media transport và realtime data trong phòng.

```text
Frontend Lobby
   -> GET /api/v1/meetings/:meetingId/join
   -> Backend validates workspace/channel access
   -> LiveKit server token
   -> LiveKitRoom
   -> audio/video/screen-share
```

Trong phòng meeting:

```text
Audio / Video / Screen Share
          -> LiveKit SFU

Chat / Shared Notes
          -> LiveKit Data Channel
          -> REST persistence
          -> MongoDB Meeting.chatLog / Meeting.notes
```

Khi meeting kết thúc:

```text
End meeting
  -> persist endedAt + duration
  -> snapshot context
  -> close participant sessions
  -> generate AI summary
  -> save transcript + summary
  -> show in meeting history
```

Cron jobs hiện chạy mỗi phút để:

- gửi email reminder cho scheduled meeting,
- kết thúc scheduled meeting đã quá hạn,
- kiểm tra `working` meeting và auto-end khi LiveKit room không còn participant.

---

## 13. AI Meeting Summary

AI summary được build từ:

- meeting title,
- meeting notes,
- persisted meeting chat log.

Backend yêu cầu model trả về JSON có schema tương đương:

```json
{
  "title": "string",
  "summary": "string",
  "key_points": [],
  "decisions": [],
  "action_items": [
    {
      "task": "string",
      "owner": null,
      "due": null
    }
  ],
  "risks_and_questions": [],
  "next_meeting": {
    "proposed_time": null,
    "agenda": []
  }
}
```

AI summary có thể được gọi trực tiếp qua endpoint summary và cũng được trigger khi meeting kết thúc.

> AI không tóm tắt audio/video transcript tự động. Context hiện tại chủ yếu đến từ notes + chat đã được persist trong meeting.

---

## 14. File sharing architecture

File upload flow:

```text
Frontend multipart upload
   -> Multer memory buffer
   -> Cloudinary
   -> FileAsset metadata in MongoDB
   -> MessageService.sendMessage(type="file")
   -> Realtime channel message
```

Cloudinary folder được tổ chức theo dạng:

```text
meeting-app/workspaces/{workspaceId}/channels/{channelId}
```

Storage quota được tính từ tổng `FileAsset.size` theo workspace.

> Legacy file router đã được disable; workspace-scoped `FileAsset.route.ts` là API chính cho file ở phiên bản hiện tại.

---

## 15. Authentication flow

ViMeet sử dụng access token + refresh token.

```text
Login / Google Login
   -> access token trả về frontend
   -> refresh token lưu HttpOnly cookie

Frontend API request
   -> Axios gắn Authorization: Bearer <accessToken>

401 response
   -> POST /api/v1/auth/refresh
   -> rotate refresh token
   -> update access token trong Zustand
   -> retry request cũ
```

Refresh token được hash trước khi lưu trong user document và được rotate khi refresh session.

---

## 16. Testing

Backend có Jest/Supertest integration tests và sử dụng `mongodb-memory-server` để chạy MongoDB isolated trong test.

Chạy test:

```bash
cd backend
npm test
```

Các nhóm test hiện có tập trung vào các phase ban đầu của collaboration module, gồm:

- channel directory,
- channel join request,
- message API,
- Socket.IO handlers,
- cursor pagination và permission của message.

Có thêm script integration:

```bash
npm run test:integration
```

Frontend hiện chưa có test suite riêng trong `package.json`.

---

## 17. CI/CD

GitHub Actions workflow nằm tại:

```text
.github/workflows/main.yml
```

Workflow hiện trigger khi push hoặc pull request vào `main`.

### Frontend job

```bash
cd frontend
npm install
npm run build
```

### Backend job

```bash
cd backend
npm install
```

> Lưu ý: CI backend hiện mới kiểm tra dependency installation, chưa chạy `npm run build` hoặc `npm test`. Nếu dùng repo cho production/team development, nên bổ sung build + test backend vào pipeline.

---

## 18. Các lệnh dev thường dùng

### Backend

```bash
cd backend

# Development
npm run dev

# TypeScript build
npm run build

# Start compiled server
npm start

# Lint
npm run lint

# Format
npm run format

# Jest tests
npm test

# Comprehensive seed
npm run seed:comprehensive

# Integration script
npm run test:integration
```

### Frontend

```bash
cd frontend

# Development
npm run dev

# Production build
npm run build

# Start production Next.js server
npm start

# Lint
npm run lint
```

---

## 19. Ghi chú triển khai hiện tại

Project hiện ở mức **full-stack functional prototype / hackathon-grade collaboration product**. Các feature chính đã nối được end-to-end, tuy nhiên một số phần vẫn cần hardening nếu triển khai production:

- Một số model/service vẫn duy trì song song legacy membership state và `ChannelMember` collection.
- Một số API contract frontend có normalization để tương thích nhiều response shape cũ.
- Test coverage chưa bao phủ toàn bộ auth/workspace/file/meeting/AI flow.
- CI backend chưa chạy TypeScript build hoặc Jest.
- Meeting status hiện dùng các state `live`, `working`, `ended`; `live` đang được dùng cho scheduled meeting trước khi participant join.
- File download/delete flow có code service/frontend nhưng workspace `FileAsset.route.ts` hiện đang disable một số route legacy tương ứng.
- AI summary hiện dựa trên chat + notes, chưa có speech-to-text/transcription pipeline.

---

## 20. Tài liệu liên quan

Repo hiện có thêm các tài liệu kỹ thuật cho collaboration module:

```text
Module 3 - Checklist chi tiet.md
Module 3 - Ke hoach thuc hien va giai thich ky thuat.md
Mô tả Module 3.md
README_MODULE3.MD
STRUCTURE.md
```

> Một số tài liệu cũ được viết trước các phase LiveKit/meeting mới nhất, vì vậy khi có khác biệt giữa docs và implementation, nên ưu tiên source code hiện tại làm source of truth.

---

## 21. Ghi chú bảo mật

- Không commit `.env`, `.env.local`, JWT secret, LiveKit secret, Cloudinary credential, SMTP password hoặc Gemini API key.
- Không đưa refresh token hoặc reset/verification token vào log production.
- Dùng secret dài, random và khác nhau giữa development/production.
- Với Gmail SMTP nên dùng App Password thay vì password tài khoản chính.
- Giới hạn CORS `FRONTEND_URL` theo domain production thực tế.
- Khi deploy production, bật HTTPS để refresh cookie chạy với `secure=true`.
- Nên dùng managed secret storage thay vì hard-code secret vào source code hoặc CI config.

---

## 22. Project flow tổng quát

```text
User
 └── Workspace
      ├── Members / Roles / Invite
      └── Channel
           ├── Realtime Messages
           │    ├── Threads
           │    ├── Reactions
           │    ├── Mentions
           │    ├── Pins
           │    └── File Attachments
           │
           └── Meeting
                ├── LiveKit Audio / Video
                ├── Screen Share
                ├── Meeting Chat
                ├── Shared Notes
                ├── Participant Tracking
                └── AI Summary
                     └── Meeting History
```

ViMeet hướng tới một collaboration experience thống nhất, nơi chat, file, workspace context và meeting history không tồn tại như các module rời rạc mà được liên kết theo cùng một workspace/channel context.
