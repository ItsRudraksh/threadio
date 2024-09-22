import express from "express";
import {
  followUnFollowUser,
  freezeAccount,
  getSuggestedUsers,
  getUserProfile,
  loginUser,
  logoutUser,
  signupUser,
  updateUser,
} from "../controllers/userController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.put("/freeze", verifyToken, freezeAccount);
router.post("/follow/:id", verifyToken, followUnFollowUser);
router.put("/update/:id", verifyToken, updateUser);
router.get("/suggested", verifyToken, getSuggestedUsers);
router.get("/profile/:query", getUserProfile);

export default router;
