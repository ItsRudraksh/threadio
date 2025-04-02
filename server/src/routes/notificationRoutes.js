import express from "express";
import {
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
  clearAllNotifications,
} from "../controllers/notificationController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, getNotifications);
router.get("/unread", verifyToken, getUnreadCount);
router.put("/mark-read/:notificationId", verifyToken, markAsRead);
router.put("/mark-all-read", verifyToken, markAllAsRead);
router.delete("/clear-all", verifyToken, clearAllNotifications);

export default router;
