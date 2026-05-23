import "dotenv/config"; // Nạp biến môi trường ngay lập tức trước bất kỳ import nào khác
import express, { Request, Response } from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import routes from "./routes"; // Import tất cả routes từ thư mục routes
import { initCronJobs } from "./scripts/cron";
import index from "./routes"; // Import tất cả routes từ thư mục routes
import { setupSocketHandlers } from "./sockets";


const app = express();
const server = http.createServer(app);
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Middleware
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);
app.use(express.json()); // Middleware parse JSON

app.use("/api/v1", index);

// Cau hinh Socket.io cho WebRTC Signaling
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});

// Lang nghe su kien ket noi co ban (Socket handshake)
io.on("connection", (socket) => {
  console.log("Mot nguoi dung vua ket noi voi ID:", socket.id);

  // Lang nghe khi nguoi dung ngat ket noi
  socket.on("disconnect", () => {
    console.log("Nguoi dung da ngat ket noi:", socket.id);
  });
});

// Ket noi MongoDB
mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log("MongoDB Atlas connected successfully");
    initCronJobs(); // Start cron jobs after DB connection
  })
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (_req: Request, res: Response) => {
  res.send("Backend Server & Socket.io & MongoDB is Running!");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server dang chay tai: http://localhost:${PORT}`);
});
