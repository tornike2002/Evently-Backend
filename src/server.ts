import express from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));


export default app;