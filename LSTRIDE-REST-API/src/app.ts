import "dotenv/config";

import express from "express";
import path from "path";

import { authMiddleware } from "./middleware/auth.middleware";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
//import postRoutes from "./routes/post.routes";

const app = express();


app.use(express.json());

app.use("/uploads",express.static(path.join(process.cwd(), "uploads")));
app.use("/api/auth", authRoutes);
app.get("/health", (req, res) => { res.json({ success: true, message: "API is running",});});

app.use("/api/users",authMiddleware, userRoutes);
// app.use("/api/users", authMiddleware, userRoutes);
// app.use("/api/posts", authMiddleware, postRoutes);

export default app;