import express, { Request, Response } from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config(); // Nạp biến môi trường

const app = express();
const server = http.createServer(app);

//Middleware
app.use(cors());
app.use(express.json()); // Middleware parse JSON

// Cấu hình Socket.io cho WebRTC Signaling
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Chỉ cho phép frontend Next.js kết nối tới
    methods: ["GET", "POST", "PUT", "DELETE"], // Các phương thức HTTP được phép
  },
});

// Lắng nghe sự kiện kết nối cơ bản (Socket handshake)
io.on("connection", (socket) => {
  console.log("🟢 Một người dùng vừa kết nối với ID:", socket.id);

  // Lắng nghe khi người dùng ngắt kết nối
  socket.on("disconnect", () => {
    console.log("🔴 Người dùng đã ngắt kết nối:", socket.id);
  });
});

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
