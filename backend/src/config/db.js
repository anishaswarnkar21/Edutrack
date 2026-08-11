import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import config from "./config.js";

let memoryServer;

function isConnectionRefused(error) {
  const messages = [
    error?.message,
    error?.cause?.message,
    error?.reason?.message,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    error?.name === "MongooseServerSelectionError" ||
    error?.name === "MongoServerSelectionError" ||
    messages.includes("ECONNREFUSED")
  );
}

async function connectToMemoryServer() {
  if (!memoryServer) {
    memoryServer = await MongoMemoryServer.create();
  }

  await mongoose.connect(memoryServer.getUri("edutrack"));
  console.warn(
    `[db] MongoDB unavailable at ${config.mongo.uri}; using in-memory fallback for this session.`
  );
  console.log(`[db] connected -> ${mongoose.connection.name} (memory)`);
}

export async function connectDB() {
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(config.mongo.uri, {
      serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 5000,
    });
    console.log(`[db] connected -> ${mongoose.connection.name}`);
  } catch (error) {
    if (config.env !== "development" || !isConnectionRefused(error)) {
      throw error;
    }

    await connectToMemoryServer();
  }

  mongoose.connection.on("error", (err) => {
    console.error("[db] connection error:", err.message);
  });
}

export async function disconnectDB() {
  await mongoose.disconnect();

  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = undefined;
  }
}
