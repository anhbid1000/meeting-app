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
  cors: { origin: "*" }, // Tạm thời để * cho development
});

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => console.log("✅ MongoDB Atlas connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.get("/", (req: Request, res: Response) => {
  res.send("Backend Server is Running! 🚀");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại: http://localhost:${PORT}`);
});
