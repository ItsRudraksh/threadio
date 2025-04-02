import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { v2 as cloudinary } from "cloudinary";
import { getRecipientSocketId, io } from "../config/socket.js";
import { deleteCloudinaryImage } from "../utils/cloudinary.js";
import { createNotification } from "./notificationController.js";
import User from "../models/user.model.js";

export const sendMessage = async (req, res) => {
  try {
    const { recipientId, message } = req.body;
    const senderId = req.user.id;
    let { img } = req.body;
    const { sharedPostId } = req.body;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, recipientId],
        lastMessage: {
          text: sharedPostId ? "Shared a post" : message,
          sender: senderId,
        },
      });
      await conversation.save();
    }

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img, {
        folder: "threadio/messageimages",
      });
      img = uploadedResponse.secure_url;
    }

    const newMessage = new Message({
      conversationId: conversation._id,
      sender: senderId,
      text: message || "",
      img: img || "",
      sharedPost: sharedPostId || null,
    });

    await Promise.all([
      newMessage.save(),
      Conversation.findByIdAndUpdate(conversation._id, {
        lastMessage: {
          text: sharedPostId ? "Shared a post" : message,
          sender: senderId,
        },
      }),
    ]);

    const recipientSocketId = getRecipientSocketId(recipientId);

    // Populate shared post information before sending to client
    let populatedMessage = await Message.findById(newMessage._id);

    if (sharedPostId) {
      populatedMessage = await Message.findById(newMessage._id).populate({
        path: "sharedPost",
        select: "text img postedBy createdAt",
        populate: {
          path: "postedBy",
          select: "username name profilePic",
        },
      });
    }

    const messageToSend = populatedMessage.toObject();

    if (recipientSocketId) {
      io.to(recipientSocketId).emit("newMessage", {
        ...messageToSend,
        _id: newMessage._id.toString(),
        conversationId: conversation._id.toString(),
        sender: senderId,
      });
    }

    // Create notification for the message
    const sender = await User.findById(senderId);

    const notificationText = sharedPostId
      ? `${sender.username} shared a post with you`
      : `${sender.username} sent you a message`;

    await createNotification(
      recipientId,
      senderId,
      "message",
      notificationText,
      sharedPostId,
      newMessage._id
    );

    res.status(201).json({
      ...messageToSend,
      _id: newMessage._id.toString(),
      conversationId: conversation._id.toString(),
      sender: senderId,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in sendMessage controller: ", error.message);
  }
};

export const getMessages = async (req, res) => {
  const { otherUserId } = req.params;
  const userId = req.user.id;
  try {
    const conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId] },
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const messages = await Message.find({
      conversationId: conversation._id,
    })
      .populate({
        path: "sharedPost",
        select: "text img postedBy createdAt",
        populate: {
          path: "postedBy",
          select: "username name profilePic",
        },
      })
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getConversations = async (req, res) => {
  const userId = req.user.id;
  try {
    const conversations = await Conversation.find({
      participants: userId,
    }).populate({
      path: "participants",
      select: "username profilePic",
    });

    // remove the current user from the participants array
    conversations.forEach((conversation) => {
      conversation.participants = conversation.participants.filter(
        (participant) => participant._id.toString() !== userId.toString()
      );
    });
    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    // Find the message
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Check if the user is the sender of the message
    if (message.sender.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "You can only delete your own messages" });
    }

    // Delete the image from Cloudinary if present
    if (message.img) {
      await deleteCloudinaryImage(message.img);
      // Remove the image reference
      message.img = "";
    }

    // Instead of deleting the message, mark it as deleted
    message.deleted = true;
    message.text = "This message was deleted";
    message.sharedPost = null;

    // Save the updated message
    await message.save();

    // Notify the recipient about the deleted message
    const conversation = await Conversation.findById(message.conversationId);
    if (conversation) {
      const recipientId = conversation.participants.find(
        (participant) => participant.toString() !== userId
      );

      if (recipientId) {
        const recipientSocketId = getRecipientSocketId(recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("messageDeleted", {
            messageId,
            isDeleted: true,
          });
        }
      }
    }

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in deleteMessage:", error.message);
  }
};

export const clearAllMessages = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const userId = req.user.id;

    // Find the conversation
    const conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId] },
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Find all messages in this conversation
    const messages = await Message.find({
      conversationId: conversation._id,
    });

    // Delete all images from Cloudinary
    const deletePromises = messages
      .filter((message) => message.img)
      .map((message) => deleteCloudinaryImage(message.img));

    await Promise.all(deletePromises);

    // Delete all messages from the database
    await Message.deleteMany({ conversationId: conversation._id });

    // Update the conversation to have no last message
    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessage: {
        text: "",
        sender: userId,
      },
    });

    // Notify the other user that the chat was cleared
    const recipientSocketId = getRecipientSocketId(otherUserId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("chatCleared", {
        conversationId: conversation._id.toString(),
      });
    }

    res.status(200).json({ message: "All messages cleared successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in clearAllMessages:", error.message);
  }
};
