import express from "express";
import {
  followUnfollow,
  forgotPassword,
  freezeAccount,
  getAllUsers,
  getFollowersAndFollowing,
  getSuggestedUsers,
  getUserProfile,
  loginUser,
  logoutUser,
  resetPassword,
  signupUser,
  updateUser,
  verifyUser,
  deleteAccount,
} from "../controllers/userController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/verify", verifyUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.put("/freeze", verifyToken, freezeAccount);
router.post("/follow/:id", verifyToken, followUnfollow);
router.put("/update/:id", verifyToken, updateUser);
router.delete("/delete", verifyToken, deleteAccount);
router.get("/suggested", verifyToken, getSuggestedUsers);
router.get("/profile/:query", getUserProfile);
router.get(
  "/:username/followers&following",
  verifyToken,
  getFollowersAndFollowing
);
router.get("/", getAllUsers);

export default router;
