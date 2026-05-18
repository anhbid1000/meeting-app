import express, { Request, Response } from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import routes from "./routes"; // Import tat ca routes tu thu muc routes

dotenv.config(); // Nap bien moi truong

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

app.use("/api/v1", routes);

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
  .then(() => console.log("MongoDB Atlas connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (_req: Request, res: Response) => {
  res.send("Backend Server & Socket.io & MongoDB is Running!");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server dang chay tai: http://localhost:${PORT}`);
});
