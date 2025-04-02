// import path from "path"; //FOR DEPLOYMENT
// import url from "url"; //FOR DEPLOYMENT
import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import userRoutes from "./src/routes/userRoutes.js";
import postRoutes from "./src/routes/postRoutes.js";
import messageRoutes from "./src/routes/messageRoutes.js";
import aiRoutes from "./src/routes/aiRoutes.js";
import { v2 as cloudinary } from "cloudinary";
import { server, app } from "./src/config/socket.js";
import { connectToDB } from "./src/config/db.js";
import job from "./src/job/job.js";

dotenv.config();

// job.start(); //FOR DEPLOYMENT

const port = process.env.PORT;
// const __filename = url.fileURLToPath(import.meta.url); //FOR DEPLOYMENT
// const __dirname = path.dirname(__filename); //FOR DEPLOYMENT

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, "../client/dist"))); //FOR DEPLOYMENT

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/ai", aiRoutes);

//FOR DEPLOYMENT
// if (process.env.NODE_ENV === "production") {
//   app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
//   });
// }

server.listen(port, () => {
  connectToDB();
  console.log(
    `Server is running on port ${port} and node-env is ${process.env.NODE_ENV}`
  );
});
