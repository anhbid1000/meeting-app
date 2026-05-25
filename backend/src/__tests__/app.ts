import express, { Application } from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import index from "../routes";

dotenv.config();

let app: Application;

export const createTestApp = async () => {
  // In-memory MongoDB for isolated test runs
  const mongoUri =
    process.env.MONGO_URI_TEST_REPLACE ||
    "mongodb://localhost:27017/meeting-app-test";
  await mongoose.connect(mongoUri);

  app = express();
  app.use(cors());
  app.use(express.json());

  // mount all routes under /api/v1
  app.use("/api/v1", index);

  // JWT secret for this test suite
  process.env.JWT_SECRET = "test-secret-key";

  return app;
};

export const closeTestApp = async () => {
  await mongoose.disconnect();
};
