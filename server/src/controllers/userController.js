import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../utils/token.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import crypto from "crypto";
import sendEmail from "../config/mail.js";
import { isValidEmail, isValidPassword } from "../utils/validation.js";

export const signupUser = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;
    // Validate email
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Validate password
    if (!isValidPassword(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters long and include 2 uppercase letters, 2 numbers, 2 special characters, and 2 lowercase letters.",
      });
    }
    const user = await User.findOne({ $or: [{ email }, { username }] });

    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate a 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Create expiration time (10 minutes)
    const verificationExpires = Date.now() + 10 * 60 * 1000;

    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
      verificationCode: otp,
      verificationExpires,
    });

    await newUser.save();

    // Send OTP email
    const transporter = nodemailer.createTransport({
      service: "gmail", // Or your email service provider
      auth: {
        user: process.env.EMAIL, // Your email
        pass: process.env.EMAIL_PASSWORD, // Your email password or app password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Verify Your Email - Threadio",
      text: `Your verification code is ${otp}. It expires in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: "Signup successful. Verify your email to complete the process.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.error("Error in signupUser: ", error.message);
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!user || !isPasswordCorrect)
      return res.status(400).json({ error: "Invalid username or password" });

    if (user.isFrozen) {
      user.isFrozen = false;
      await user.save();
    }

    generateTokenAndSetCookie(res, user._id);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      bio: user.bio,
      profilePic: user.profilePic,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in loginUser: ", error.message);
  }
};

export const logoutUser = (req, res) => {
  try {
    res.cookie("token", "", { maxAge: 1 });
    res.status(200).json({ message: "User logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in signupUser: ", err.message);
  }
};

export const verifyUser = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: "User already verified" });
    }

    if (
      user.verificationCode !== otp ||
      user.verificationExpires < Date.now()
    ) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationExpires = undefined;

    await user.save();

    generateTokenAndSetCookie(res, user._id);

    res.status(200).json({
      message: "Verification successful",
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      bio: user.bio,
      profilePic: user.profilePic,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.error("Error in verifyUser: ", error.message);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Save token and expiry to the user's document
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Send reset link via email
    // const resetUrl = `http://localhost:3000/reset-password/${resetToken}`; //Local URL
    const resetUrl = `https://threadio.onrender.com/reset-password/${resetToken}`; //Deployed URL
    const message = `You have requested to reset your password. Click the link below to reset it:\n\n${resetUrl}\n\nIf you didn't request this, ignore this email.`;

    await sendEmail({
      to: user.email,
      subject: "Password Reset",
      text: message,
    });

    res.status(200).json({ message: "Password reset email sent!" });
  } catch (error) {
    console.error("Error in forgotPassword:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Validate password
    if (!isValidPassword(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters long and include 2 uppercase letters, 2 numbers, 2 special characters, and 2 lowercase letters.",
      });
    }

    // Hash the token to match with the stored hashed token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with the matching token and ensure it's not expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }, // Token must not be expired
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Update user's password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;

    // Clear the reset token and expiry fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password has been reset!" });
  } catch (error) {
    console.error("Error in resetPassword:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const freezeAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    user.isFrozen = true;
    await user.save();

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const followUnFollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user.id);

    if (id === req.user.id.toString())
      return res
        .status(400)
        .json({ error: "You cannot follow or unfollow yourself" });

    if (!userToModify || !currentUser)
      return res.status(400).json({ error: "User not found" });

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // Unfollow user
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user.id } });
      await User.findByIdAndUpdate(req.user.id, { $pull: { following: id } });
      res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      // Follow user
      await User.findByIdAndUpdate(id, { $push: { followers: req.user.id } });
      await User.findByIdAndUpdate(req.user.id, { $push: { following: id } });
      res.status(200).json({ message: "User followed successfully" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in followUnFollowUser: ", err.message);
  }
};

export const updateUser = async (req, res) => {
  const { name, email, username, password, bio } = req.body;
  let { profilePic } = req.body;

  const userId = req.user.id;
  try {
    let user = await User.findById(userId);
    if (!user) return res.status(400).json({ error: "User not found" });

    if (req.params.id !== userId.toString())
      return res
        .status(400)
        .json({ error: "You cannot update other user's profile" });

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }

    if (profilePic) {
      if (user.profilePic) {
        await cloudinary.uploader.destroy(
          user.profilePic.split("/").pop().split(".")[0]
        );
      }

      const uploadedResponse = await cloudinary.uploader.upload(profilePic);
      profilePic = uploadedResponse.secure_url;
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.username = username || user.username;
    user.profilePic = profilePic || user.profilePic;
    user.bio = bio || user.bio;

    user = await user.save();

    // Find all posts that this user replied and update username and userProfilePic fields
    await Post.updateMany(
      { "replies.userId": userId },
      {
        $set: {
          "replies.$[reply].username": user.username,
          "replies.$[reply].userProfilePic": user.profilePic,
        },
      },
      { arrayFilters: [{ "reply.userId": userId }] }
    );

    // password should be null in response
    user.password = null;

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in updateUser: ", err.message);
  }
};

// Convert userId to ObjectId
const ObjectId = mongoose.Types.ObjectId;
export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user.id; // Get the userId from the verified token
    // console.log(userId);

    // Find the users followed by the current user
    const usersFollowedByYou = await User.findById(userId).select("following");

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: new ObjectId(userId) }, // Exclude the current user
        },
      },
      {
        $sample: { size: 10 }, // Randomly sample 10 users
      },
    ]);

    // Filter out users that are already followed by the current user
    const filteredUsers = users.filter(
      (user) => !usersFollowedByYou.following.includes(user._id.toString())
    );

    // Take only 4 users from the filtered list
    const suggestedUsers = filteredUsers.slice(0, 4);

    // Remove password field
    suggestedUsers.forEach((user) => (user.password = null));

    // Send the suggested users as response
    res.status(200).json(suggestedUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  // We will fetch user profile either with username or userId
  // query is either username or userId
  const { query } = req.params;

  try {
    let user;

    // query is userId
    if (mongoose.Types.ObjectId.isValid(query)) {
      user = await User.findOne({ _id: query })
        .select("-password")
        .select("-updatedAt");
    } else {
      // query is username
      user = await User.findOne({ username: query })
        .select("-password")
        .select("-updatedAt");
    }

    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in getUserProfile: ", err.message);
  }
};

export const getFollowersAndFollowing = async (req, res) => {
  try {
    const userId = req.user.id;
    const foundUser = await User.findById(userId);
    if (!foundUser) return res.status(400).json({ error: "User not found" });
    // Use Promise.all to wait for all async operations
    const userFollowers = await Promise.all(
      foundUser.followers.map(async (follower) => {
        const foundFollower = await User.findById(follower);
        return foundFollower;
      })
    );

    const userFollowing = await Promise.all(
      foundUser.following.map(async (followed) => {
        const foundFollowed = await User.findById(followed);
        return foundFollowed;
      })
    );

    // Return both arrays
    res.status(200).json({
      userFollowers,
      userFollowing,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in getFollowers: ", error.message);
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.find();
    res.status(200).json({ allUsers });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in getAllUsers: ", error.message);
  }
};
