const jwt = require("jsonwebtoken");
const { comparePassword, hashPassword } = require("../helper/passwordHash.js");
const UserModel = require("../model/userModel.js");
const dotenv = require("dotenv");

dotenv.config();

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name.trim()) {
      return res.json({ error: "Name is required" });
    }
    if (!email) {
      return res.json({ error: "Email is required" });
    }
    if (!password || password.length < 6) {
      return res.json({ error: "Password should be longer than 6 characters" });
    }
    if (role === undefined) {
      return res.json({ error: "Role is required" });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.json({ error: "Email is already taken" });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await new UserModel({
      name,
      email,
      password: hashedPassword,
      role,
    }).save();

    const token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECURE, {
      expiresIn: "7d",
    });

    res.json({
      newUser: {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.json({ error: "Email is required" });
    }
    if (!password || password.length < 6) {
      return res.json({ error: "Password should be longer than 6 characters" });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.json({ error: "User Not Found" });
    }

    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.json({ error: "Password wrong" });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECURE, {
      expiresIn: "7d",
    });

    res.json({
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const userList = async (req, res) => {
  try {
    const user = await UserModel.find({});
    res.json(user);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const removeUser = async (req, res) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.params.userId);
    res.json(user);
  } catch (err) {
    return res.status(400).json({ error: "Access Denied!" });
  }
};

const privateRoute = async (req, res) => {
  res.json({ currentUser: req.user });
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    if (!oldPassword || !oldPassword.trim()) {
      return res.status(400).json({ error: "Old password is required" });
    }
    if (!newPassword || !newPassword.trim()) {
      return res.status(400).json({ error: "New password is required" });
    }
    if (!confirmPassword || !confirmPassword.trim()) {
      return res.status(400).json({ error: "Confirm password is required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password should be longer than 6 characters" });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "New password and confirm password do not match" });
    }

    const existingUser = await UserModel.findById(req.user._id);
    const match = await comparePassword(oldPassword, existingUser.password);
    if (!match) {
      return res.status(400).json({ error: "Old password is incorrect" });
    }

    const hashedPassword = await hashPassword(newPassword);
    existingUser.password = hashedPassword;
    await existingUser.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const hashedPassword = await hashPassword('123456');

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Password has been reset to '123456'" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  userList,
  removeUser,
  privateRoute,
  changePassword,
  resetPassword,
};
