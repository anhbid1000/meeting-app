import express, { Request, Response } from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import index from "./routes"; // Import tất cả routes từ thư mục routes
import { setupSocketHandlers } from "./sockets";

dotenv.config(); // Nạp biến môi trường

const app = express();
const server = http.createServer(app);

//Middleware
app.use(cors());
app.use(express.json()); // Middleware parse JSON

app.use("/api/v1", index);

// Cấu hình Socket.io cho WebRTC Signaling
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL, // Chỉ cho phép frontend Next.js kết nối tới
    methods: ["GET", "POST", "PUT", "DELETE"], // Các phương thức HTTP được phép
  },
});

setupSocketHandlers(io);

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => console.log("✅ MongoDB Atlas connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.get("/", (req: Request, res: Response) => {
  res.send("Backend Server & Socket.io & MongoDB is Running! 🚀");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại: http://localhost:${PORT}`);
});
