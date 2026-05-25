# 📂 ViMeet Project Structure

## Tổng quan kiến trúc

ViMeet là một ứng dụng **SPA (Single-Page Application)** được xây dựng với **Next.js 15 (App Router)** cho frontend và **Express.js** cho backend. Dữ liệu được lưu trữ trong **MongoDB**.

---

## 🏗️ Cấu trúc thư mục toàn bộ dự án

```
meeting-app/
├── frontend/                          # Next.js 15 (SPA + CSR)
│   ├── public/                        # Tài sản tĩnh (favicon, images)
│   ├── src/
│   │   ├── app/                       # App Router (Next.js 15)
│   │   │   ├── layout.tsx             # Root layout (toàn app)
│   │   │   ├── globals.css            # Tailwind + custom styles
│   │   │   ├── page.tsx               # Landing page "/"
│   │   │   │
│   │   │   ├── (marketing)/           # Route group (không ảnh hưởng URL)
│   │   │   │   ├── page.tsx           # Landing page (nếu cần tách)
│   │   │   │   └── layout.tsx         # Layout cho marketing pages
│   │   │   │
│   │   │   ├── pricing/               # Trang bảng giá
│   │   │   │   └── page.tsx           # "/pricing"
│   │   │   │
│   │   │   ├── login/                 # Trang đăng nhập
│   │   │   │   └── page.tsx           # "/login"
│   │   │   │
│   │   │   ├── register/              # Trang đăng ký
│   │   │   │   └── page.tsx           # "/register"
│   │   │   │
│   │   │   └── (dashboard)/           # Route group cho dashboard
│   │   │       ├── layout.tsx         # Layout có Sidebar (áp dụng cho tất cả con)
│   │   │       ├── dashboard/
│   │   │       │   └── page.tsx       # "/dashboard"
│   │   │       ├── groups/
│   │   │       │   └── page.tsx       # "/groups"
│   │   │       ├── meetings/
│   │   │       │   └── page.tsx       # "/meetings"
│   │   │       ├── channels/
│   │   │       │   └── page.tsx       # "/channels"
│   │   │       ├── history/
│   │   │       │   └── page.tsx       # "/history"
│   │   │       ├── files/
│   │   │       │   └── page.tsx       # "/files"
│   │   │       ├── profile/
│   │   │       │   └── page.tsx       # "/profile"
│   │   │       └── settings/
│   │   │           └── page.tsx       # "/settings"
│   │   │
│   │   ├── components/                # React components
│   │   │   ├── layout/
│   │   │   │   ├── TopNav.tsx         # Navbar (dùng chung)
│   │   │   │   ├── Sidebar.tsx        # Sidebar (dùng trong dashboard)
│   │   │   │   └── Footer.tsx         # Footer (dùng chung)
│   │   │   │
│   │   │   ├── landing/               # Components cho landing page
│   │   │   │   ├── Hero.tsx
│   │   │   │   ├── Features.tsx
│   │   │   │   └── index.ts           # Export gọn
│   │   │   │
│   │   │   ├── modal/                 # Modal components
│   │   │   │   └── CreateChannelModal.tsx
│   │   │   │
│   │   │   ├── chat/                  # Components cho chat (Module 2)
│   │   │   │   ├── MessageList.tsx
│   │   │   │   ├── MessageInput.tsx
│   │   │   │   └── ChatPanel.tsx
│   │   │   │
│   │   │   └── ui/                    # Atomic UI components
│   │   │       ├── Button.tsx
│   │   │       ├── Container.tsx
│   │   │       ├── Badge.tsx
│   │   │       └── LoadingSpinner.tsx
│   │   │
│   │   ├── hooks/                     # Custom React hooks
│   │   │   ├── useAuth.ts             # Auth logic
│   │   │   ├── useLogin.ts            # Login hook
│   │   │   ├── useChannels.ts         # Channels queries (React-Query)
│   │   │   ├── useMessages.ts         # Messages queries (React-Query)
│   │   │   └── useWebRTC.ts           # WebRTC logic (Module 3)
│   │   │
│   │   ├── store/                     # Zustand stores
│   │   │   └── authStore.ts           # Auth state management
│   │   │
│   │   ├── lib/                       # Utilities & configs
│   │   │   ├── api.ts                 # Axios instance
│   │   │   └── constants.ts           # App constants
│   │   │
│   │   ├── services/                  # API service layer
│   │   │   ├── api.ts                 # REST API calls
│   │   │   ├── socket.ts              # Socket.io client
│   │   │   └── webrtc.ts              # WebRTC helpers
│   │   │
│   │   └── types/                     # TypeScript types
│   │       ├── user.ts
│   │       ├── channel.ts
│   │       ├── message.ts
│   │       └── index.ts
│   │
│   ├── .env.local                     # Environment variables (local)
│   ├── .env.production                # Environment variables (production)
│   ├── tailwind.config.cjs            # Tailwind CSS config
│   ├── postcss.config.cjs             # PostCSS config
│   ├── tsconfig.json                  # TypeScript config
│   ├── next.config.js                 # Next.js config
│   ├── package.json
│   └── package-lock.json
│
├── backend/                           # Express.js API Server
│   ├── src/
│   │   ├── config/                    # Configuration
│   │   │   ├── database.js            # MongoDB connection
│   │   │   └── env.js                 # Environment variables
│   │   │
│   │   ├── models/                    # Mongoose schemas
│   │   │   ├── user.js
│   │   │   ├── channel.js
│   │   │   ├── message.js
│   │   │   └── index.js               # Export gọn
│   │   │
│   │   ├── controllers/               # Business logic
│   │   │   ├── authController.js
│   │   │   ├── channelController.js
│   │   │   ├── messageController.js
│   │   │   └── userController.js
│   │   │
│   │   ├── routes/                    # API routes
│   │   │   ├── v1/
│   │   │   │   ├── auth.js            # POST /api/v1/auth/login, /logout
│   │   │   │   ├── channels.js        # CRUD channels
│   │   │   │   ├── messages.js        # Messages + pagination
│   │   │   │   └── users.js           # User endpoints
│   │   │   └── index.js               # Route aggregator
│   │   │
│   │   ├── middlewares/               # Express middlewares
│   │   │   ├── auth.js                # JWT verification
│   │   │   ├── errorHandler.js        # Error handling
│   │   │   └── validation.js          # Input validation
│   │   │
│   │   ├── services/                  # Business logic layer
│   │   │   ├── authService.js
│   │   │   ├── channelService.js
│   │   │   ├── messageService.js
│   │   │   └── userService.js
│   │   │
│   │   ├── utils/                     # Helper functions
│   │   │   ├── pagination.js          # Cursor-based pagination
│   │   │   ├── jwt.js                 # JWT utilities
│   │   │   ├── hash.js                # Password hashing
│   │   │   └── validators.js          # Validation helpers
│   │   │
│   │   ├── sockets/                   # Socket.io handlers (Module 2+)
│   │   │   ├── signaling.js           # WebRTC signaling
│   │   │   ├── room.js                # Room management
│   │   │   └── chat.js                # Real-time chat
│   │   │
│   │   └── index.js                   # Express app entry point
│   │
│   ├── .env                           # Environment variables
│   ├── .env.example                   # Example env file
│   ├── package.json
│   ├── package-lock.json
│   └── nodemon.json                   # Nodemon config (auto-reload)
│
├── shared/                            # (Optional) Shared code
│   └── types/                         # Shared TypeScript types
│       ├── user.ts
│       ├── channel.ts
│       └── message.ts
│
├── docker-compose.yml                 # Docker compose (MongoDB + Backend)
├── .gitignore
├── README.md
└── STRUCTURE.md                       # File này
```

---

## 🔄 Luồng dữ liệu (Data Flow)

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js SPA)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ React Components (Client-side rendering)            │   │
│  │ - TopNav, Sidebar, MessageList, etc.                │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓ fetch()                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Zustand Store (authStore)                           │   │
│  │ - user, token, isAuthenticated                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓ API calls                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ React-Query (useMessages, useChannels)              │   │
│  │ - Cache, pagination, infinite scroll                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Express.js)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Routes: /api/v1/auth, /channels, /messages          │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Controllers (Business Logic)                        │   │
│  │ - authController, channelController, etc.           │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Services (Data Processing)                          │   │
│  │ - authService, channelService, etc.                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Models (Mongoose Schemas)                           │   │
│  │ - User, Channel, Message                            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↓ Query
┌─────────────────────────────────────────────────────────────┐
│                   Database (MongoDB)                         │
│  - Collections: users, channels, messages                   │
│  - Indexes: compound index, text index                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Các Module chính

### Module 1: Authentication & Landing Page ✅
- **Frontend**: Landing page, Pricing page, Login/Register forms
- **Backend**: JWT auth, user management
- **Status**: Hoàn thành cơ bản

### Module 2: Chat Channels & Messages (In Progress)
- **Frontend**: Sidebar, Channel list, Message list (infinite scroll), Message input
- **Backend**: Channel CRUD, cursor-based pagination, full-text search
- **Database**: Channel schema, Message schema, indexes
- **Status**: Đang phát triển

### Module 3: Video Meetings & WebRTC (Planned)
- **Frontend**: Video grid, meeting controls, screen sharing
- **Backend**: WebRTC signaling, room management
- **Status**: Chưa bắt đầu

### Module 4: Real-time Features (Planned)
- **Frontend**: Socket.io client, real-time notifications
- **Backend**: Socket.io handlers, event broadcasting
- **Status**: Chưa bắt đầu

---

## 🚀 Cách chạy dự án

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
# Truy cập: http://localhost:3004 (hoặc port hiện tại)
```

### Backend (Express)
```bash
cd backend
npm install
npm run dev
# Server chạy ở: http://localhost:5000
```

### Database (MongoDB)
```bash
# Nếu dùng Docker
docker-compose up -d

# Hoặc MongoDB local
mongod
```

---

## 🔑 Environment Variables

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Backend (`.env`)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/vimeet
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

---

## 📦 Dependencies chính

### Frontend
- **Next.js 15**: App Router, SSR/CSR
- **React 19**: UI library
- **Tailwind CSS**: Styling
- **Zustand**: State management
- **React-Query**: Data fetching & caching
- **Axios**: HTTP client
- **Socket.io-client**: Real-time communication
- **TypeScript**: Type safety

### Backend
- **Express.js**: Web framework
- **Mongoose**: MongoDB ODM
- **JWT**: Authentication
- **Socket.io**: Real-time events
- **Cors**: Cross-origin requests
- **Dotenv**: Environment variables

---

## 🎯 Routing Map

### Public Routes (Không cần đăng nhập)
- `/` - Landing page
- `/pricing` - Bảng giá
- `/login` - Đăng nhập
- `/register` - Đăng ký

### Protected Routes (Cần đăng nhập)
- `/dashboard` - Dashboard chính
- `/groups` - Danh sách nhóm
- `/meetings` - Danh sách cuộc họp
- `/channels` - Danh sách kênh
- `/history` - Lịch sử
- `/files` - Quản lý file
- `/profile` - Hồ sơ người dùng
- `/settings` - Cài đặt

---

## 🔐 Authentication Flow

```
1. User vào /login
   ↓
2. Nhập email + password
   ↓
3. Frontend gọi POST /api/v1/auth/login
   ↓
4. Backend xác thực, trả token + user info
   ↓
5. Frontend lưu token vào Zustand store (+ localStorage)
   ↓
6. Middleware kiểm tra token, redirect tới /dashboard
   ↓
7. Sidebar hiển thị, TopNav cập nhật (Dashboard button)
```

---

## 📊 Database Schema (Module 2)

### User Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  name: String,
  avatar: String (URL),
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Channel Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  slug: String (unique),
  type: String (public/private),
  createdBy: ObjectId (ref: User),
  members: [ObjectId] (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Message Collection
```javascript
{
  _id: ObjectId,
  channelId: ObjectId (ref: Channel, indexed),
  userId: ObjectId (ref: User, indexed),
  content: String (max 2000 chars),
  createdAt: Date (indexed),
  updatedAt: Date
}
// Indexes:
// - { channelId: 1, createdAt: -1 } (compound)
// - { content: "text" } (full-text search)
```

---

## 🛠️ Development Workflow

1. **Tạo feature branch**
   ```bash
   git checkout -b feature/channel-list
   ```

2. **Phát triển & test**
   ```bash
   npm run dev
   npm run lint
   ```

3. **Commit & push**
   ```bash
   git add .
   git commit -m "feat: add channel list"
   git push -u origin feature/channel-list
   ```

4. **Tạo Pull Request**
   - Mô tả thay đổi
   - Link issue (nếu có)
   - Request review

---

## 📝 Ghi chú quan trọng

- **SPA Architecture**: Tất cả routing được xử lý bằng JavaScript (client-side), không có page reload.
- **Tailwind Config**: Các màu sắc custom được định nghĩa trong `tailwind.config.cjs`.
- **Cursor-based Pagination**: Dùng `_id` (ObjectId) làm cursor thay vì offset.
- **Route Groups**: `(dashboard)` không ảnh hưởng URL, chỉ dùng để nhóm layout.
- **Middleware**: Kiểm tra token ở `src/middleware.ts` để bảo vệ các route.

---

## 📚 Tài liệu tham khảo

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Express.js Docs](https://expressjs.com/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React-Query Docs](https://tanstack.com/query/latest)
- [Zustand Docs](https://github.com/pmndrs/zustand)

---

**Last Updated**: 2026-05-18  
**Version**: 1.0
