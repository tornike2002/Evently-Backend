import dotenv from "dotenv";
import { connectDB } from "./config/db";
dotenv.config();
import app from "./server";

const PORT = process.env.PORT!;
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${process.env.PORT}`);
  });
};

startServer();
