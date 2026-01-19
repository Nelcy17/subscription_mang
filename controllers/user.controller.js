import User from "../models/user.model.js";

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id).select("-password");

    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const id = req.params.id;

    const user = await User.findById(id);
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    if (req.user.id !== id) {
      const error = new Error("You are not authorized to update this user");
      error.status = 403;
      throw error;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: req.body }, // Only update provided fields
      { new: true, runValidators: true }
    );
    res.status(200).json({
      success: true,
      data: updatedUser,
      message: "User updated successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
    try {
      const { id } = req.params;
  
      // Find user
      const user = await User.findById(id);
      if (!user) {
        const error = new Error("User not found");
        error.status = 404;
        throw error;
      }
  
      // Ensure only the user themselves or an admin can delete
      if (id.toString() !== req.user.id.toString()) {
        const error = new Error("You are not authorized to delete this user");
        error.status = 403;
        throw error;
      }
  
      await User.findByIdAndDelete(id);
  
      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  };
  
  