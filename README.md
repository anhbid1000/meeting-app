# Meeting.App

Ứng dụng họp trực tuyến theo kiến trúc tách rời **Frontend (Next.js)** và **Backend (Express + Socket.io + MongoDB)**.

> Lưu ý hiện trạng: Backend hiện có endpoint health-check (`GET /`), kết nối MongoDB qua Mongoose và thiết lập Socket.io (handshake + log connect/disconnect). Các thư mục `controllers/`, `routes/`, `sockets/`… đang ở trạng thái scaffold (chưa được wire vào `server.ts`).

## Kiến trúc

- **Frontend**: Next.js (App Router) + React + TailwindCSS
- **Backend**: Express (TypeScript) + Socket.io (WebSocket signaling nền tảng) + Mongoose
- **Giao tiếp**:
  - HTTP (REST) qua `axios`
  - Realtime qua `socket.io-client`

## Yêu cầu môi trường

- Node.js **LTS** (khuyến nghị 18+)
- npm (hoặc yarn/pnpm/bun nếu bạn muốn, nhưng hướng dẫn dưới dùng npm)
- MongoDB (local hoặc MongoDB Atlas)

## Cấu hình biến môi trường

### Backend (`backend/.env`)

Tạo file `backend/.env` (không commit lên git) với nội dung mẫu:

```env
# Port cho Express/Socket.io
PORT=5000

# Cho phép CORS từ frontend
FRONTEND_URL=http://localhost:3000

# MongoDB connection string (local hoặc Atlas)
MONGODB_URI=mongodb://127.0.0.1:27017/meeting_app
```

### Frontend (`frontend/.env.local`)

Tạo file `frontend/.env.local` (không commit) với nội dung mẫu:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

## Cài đặt

Mở 2 terminal (hoặc chạy lần lượt):

### 1) Cài dependencies Backend

```bash
cd backend
npm install
```

### 2) Cài dependencies Frontend

```bash
cd ../frontend
npm install
```

## Chạy dự án (Development)

### 1) Chạy Backend

```bash
cd backend
npm run dev
```

Mặc định chạy tại: `http://localhost:5000`

### 2) Chạy Frontend

```bash
cd frontend
npm run dev
```

Mặc định chạy tại: `http://localhost:3000`

Khi vào trang chủ, Frontend sẽ thử kết nối Socket.io tới backend và hiển thị **Socket ID** nếu kết nối thành công.

## Build & chạy Production

### Backend

```bash
cd backend
npm run build
npm run start
```

### Frontend

```bash
cd frontend
npm run build
npm run start
```

## Scripts

### Backend (`backend/package.json`)

- `npm run dev`: chạy dev với `nodemon` + `ts-node`
- `npm run build`: build TypeScript ra `dist/`
- `npm run start`: chạy `dist/server.js`
- `npm run lint`: lint
- `npm run format`: prettier format

### Frontend (`frontend/package.json`)

- `npm run dev`: chạy Next dev server
- `npm run build`: build
- `npm run start`: start production server
- `npm run lint`: lint

## Cấu trúc thư mục

```text
Project-meeting-app/
	backend/
		src/
			server.ts            # Express + Socket.io + MongoDB connect
			controllers/         # (scaffold)
			routes/              # (scaffold)
			sockets/             # (scaffold)
			services/            # (scaffold)
			models/              # (scaffold)
			middlewares/         # (scaffold)
			types/
	frontend/
		src/
			app/                 # Next.js App Router
			components/
			services/api.ts      # axios instance + attach token
			store/               # zustand
			hooks/ lib/ types/
```

## Troubleshooting

- **Backend báo lỗi kết nối MongoDB**: kiểm tra `MONGODB_URI` trong `backend/.env` và đảm bảo MongoDB đang chạy/Atlas IP whitelist đúng.
- **Socket.io không kết nối được**:
  - kiểm tra `NEXT_PUBLIC_BACKEND_URL` (frontend) trỏ đúng port backend
  - nếu đổi port FE, cập nhật `FRONTEND_URL` (backend) để CORS cho phép
- **CORS error**: đảm bảo `FRONTEND_URL` khớp URL đang chạy frontend (vd `http://localhost:3000`).
