import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/user.model.js";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env.js";

export const signUp = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("Email already exists");
      error.status = 409;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUsers = await User.create(
      [{ name, email, password: hashedPassword }],
      { session }
    );

    const token = jwt.sign({ userId: newUsers[0]._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        token,
        user: newUsers[0],
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      const error = new Error("Invalid password");
      error.status = 401;
      throw error;
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    res.status(200).json({
      success: true,
      message: "User signed in successfully",
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const signOut = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing or invalid",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify the token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      // Get user from database
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      return res.status(200).json({
        success: true,
        message: "User signed out successfully",
      });
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
  } catch (error) {
    next(error);
  }
};
