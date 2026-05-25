import mongoose from "mongoose";
import Workspace from "./src/models/Workspace.model";
import * as dotenv from "dotenv";

dotenv.config();

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const result = await Workspace.updateMany({}, { $set: { plan: "pro" } });
  console.log("Updated workspaces:", result.modifiedCount);
  process.exit(0);
}
fix();
