import app from "./src/app.js";
import dotenv from "dotenv";
import { connectToDB } from "./src/config/db.js";
dotenv.config();

const port = process.env.PORT;

app.listen(port, () => {
  connectToDB();
  console.log(`Server is running on port ${port}`);
});
