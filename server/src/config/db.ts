import mongoose from "mongoose"
import { MONGO_URI, SAMPLE_MODE } from "./env"

export async function connectDB() {
  if (SAMPLE_MODE) {
    console.log("SAMPLE_MODE enabled: skipping MongoDB connection")
    return
  }
  await mongoose.connect(MONGO_URI)
  console.log("MongoDB connected")
}
