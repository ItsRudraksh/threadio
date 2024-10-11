import path from "path"; //FOR DEPLOYMENT
import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import userRoutes from "./src/routes/userRoutes.js";
import postRoutes from "./src/routes/postRoutes.js";
import messageRoutes from "./src/routes/messageRoutes.js";
import { v2 as cloudinary } from "cloudinary";
import { server, app } from "./src/config/socket.js";
import { connectToDB } from "./src/config/db.js";
dotenv.config();

const port = process.env.PORT;
const __dirname = path.resolve(); //FOR DEPLOYMENT

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/messages", messageRoutes);

//FOR DEPLOYMENT

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  // react app
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

server.listen(port, () => {
  connectToDB();
  console.log(
    `Server is running on port ${port} and node-env is ${process.env.NODE_ENV}`
  );
});
