import express from "express";
import cors from "cors";
import morgan from "morgan";
import config from "./config/config.js";
import apiRouter from "./routes/index.js";
import { notFoundHandler, errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (config.env !== "test") app.use(morgan(config.env === "development" ? "dev" : "combined"));

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/v1", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
