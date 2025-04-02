import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { v2 as cloudinary } from "cloudinary";
import { getRecipientSocketId, io } from "../config/socket.js";
import { deleteCloudinaryImage } from "../utils/cloudinary.js";

export const sendMessage = async (req, res) => {
  try {
    const { recipientId, message } = req.body;
    let { img } = req.body;
    const senderId = req.user.id;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, recipientId],
        lastMessage: {
          text: message,
          sender: senderId,
        },
      });
      await conversation.save();
    }

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img, {
        folder: "threadio/messageimages",
        resource_type: "image",
      });
      img = uploadedResponse.secure_url;
    }

    const newMessage = new Message({
      conversationId: conversation._id,
      sender: senderId,
      text: message,
      img: img || "",
    });

    await Promise.all([
      newMessage.save(),
      conversation.updateOne({
        lastMessage: {
          text: message,
          sender: senderId,
        },
      }),
    ]);

    const recipientSocketId = getRecipientSocketId(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    }).sort({ createdAt: 1 });

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
