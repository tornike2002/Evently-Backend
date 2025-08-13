import express from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth";
import eventsRoutes from "./routes/events";
import cartRoutes from "./routes/cart";

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/cart", cartRoutes);
export default app;
