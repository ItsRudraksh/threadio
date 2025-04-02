import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import { v2 as cloudinary } from "cloudinary";
import { deleteCloudinaryImage } from "../utils/cloudinary.js";
import { createNotification } from "./notificationController.js";

export const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserPosts = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const posts = await Post.find({ postedBy: user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFeedPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const following = user.following;

    const feedPosts = await Post.find({ postedBy: { $in: following } }).sort({
      createdAt: -1,
    });

    res.status(200).json(feedPosts);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error getting feed: ", err.message);
  }
};

export const createPost = async (req, res) => {
  try {
    const { postedBy, text } = req.body;
    let { img } = req.body;

    if (!postedBy || !text) {
      return res
        .status(400)
        .json({ error: "Postedby and text fields are required" });
    }

    const user = await User.findById(postedBy);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user._id.toString() !== req.user.id.toString()) {
      return res.status(401).json({ error: "Unauthorized to create post" });
    }

    const maxLength = 500;
    if (text.length > maxLength) {
      return res
        .status(400)
        .json({ error: `Text must be less than ${maxLength} characters` });
    }

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img, {
        folder: "threadio/postimages",
        resource_type: "image",
      });
      img = uploadedResponse.secure_url;
    }

    const newPost = new Post({ postedBy, text, img });
    await newPost.save();

    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log(err);
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.postedBy.toString() !== req.user.id.toString()) {
      return res.status(401).json({ error: "Unauthorized to delete post" });
    }

    // Delete image from Cloudinary if it exists
    if (post.img) {
      await deleteCloudinaryImage(post.img);
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const userLikedPost = post.likes.includes(userId);

    if (userLikedPost) {
      // Unlike post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      res.status(200).json({ message: "Post unliked successfully" });
    } else {
      // Like post
      post.likes.push(userId);
      await post.save();

      // Create notification for post like
      if (post.postedBy.toString() !== userId) {
        const user = await User.findById(userId);
        await createNotification(
          post.postedBy,
          userId,
          "like",
          `${user.username} liked your post`,
          postId
        );
      }

      res.status(200).json({ message: "Post liked successfully" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const replyToPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user.id;

    const foundUser = await User.findById(userId);

    const userProfilePic = foundUser.profilePic;
    const username = foundUser.username;

    if (!text) {
      return res.status(400).json({ error: "Text field is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const reply = { userId, text, userProfilePic, username };

    post.replies.push(reply);
    await post.save();

    // Create notification for reply
    if (post.postedBy.toString() !== userId) {
      await createNotification(
        post.postedBy,
        userId,
        "reply",
        `${username} replied to your post: "${text.substring(0, 30)}${
          text.length > 30 ? "..." : ""
        }"`,
        postId
      );
    }

    res.status(200).json(reply);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserReplies = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find all posts where this user has replied
    const postsWithReplies = await Post.find({
      "replies.userId": user._id,
    }).sort({
      createdAt: -1,
    });

    // For each post, filter to only include the user's replies
    const userReplies = postsWithReplies.map((post) => {
      // Get the original post data
      const { _id, text, img, postedBy, createdAt } = post;

      // Filter to only include replies by this user
      const userReplies = post.replies.filter(
        (reply) => reply.userId.toString() === user._id.toString()
      );

      // Return a modified post object with only this user's replies
      return {
        _id,
        text,
        img,
        postedBy,
        createdAt,
        replies: userReplies,
        originalPost: true,
      };
    });

    res.status(200).json(userReplies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
