import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { getRecipientSocketId, io } from "../config/socket.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .populate("sender", "username profilePic name")
      .limit(50);

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error in getNotifications: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await Notification.countDocuments({
      recipient: userId,
      read: false,
    });

    res.status(200).json({ count });
  } catch (error) {
    console.error("Error in getUnreadCount: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    if (notification.recipient.toString() !== userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error in markAsRead: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { recipient: userId, read: false },
      { read: true }
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error in markAllAsRead: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const clearAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.deleteMany({ recipient: userId });

    res.status(200).json({ message: "All notifications cleared" });
  } catch (error) {
    console.error("Error in clearAllNotifications: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Helper function to create notification and emit socket event
export const createNotification = async (
  recipientId,
  senderId,
  type,
  text,
  postId = null,
  messageId = null
) => {
  try {
    // Don't create notification if recipient is the sender
    if (recipientId.toString() === senderId.toString()) {
      return;
    }

    const newNotification = new Notification({
      recipient: recipientId,
      sender: senderId,
      type,
      text,
      post: postId,
      message: messageId,
      read: false,
    });

    await newNotification.save();

    // Populate sender details
    const populatedNotification = await Notification.findById(
      newNotification._id
    ).populate("sender", "username profilePic name");

    // Get online status and emit if user is online
    const recipientSocketId = getRecipientSocketId(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("newNotification", populatedNotification);
    }

    return newNotification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};
