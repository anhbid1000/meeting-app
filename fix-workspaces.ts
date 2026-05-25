import mongoose from "mongoose";
import Workspace from "./backend/src/models/Workspace.model";
import dotenv from "dotenv";

dotenv.config({ path: "./backend/.env" });

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const result = await Workspace.updateMany({}, { $set: { plan: "pro" } });
  console.log("Updated workspaces:", result.modifiedCount);
  process.exit(0);
}
fix();
