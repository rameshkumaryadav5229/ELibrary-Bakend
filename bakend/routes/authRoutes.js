const express = require("express");
const User = require("../models/User");
const router = express.Router();

// User Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    // Create new user with role "user"
    const newUser = new User({
      name,
      email,
      password, // plain text (production में bcrypt लगाएं)
      role: "user",
    });
    await newUser.save();

    res.json({ success: true, message: "User signup successful" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Login (User/Admin)
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Find by email & role
    const user = await User.findOne({ email, role });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: `${role} not found` });
    }

    // Plain text password check
    if (password !== user.password) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }

    res.json({
      success: true,
      message: `${role} login successful`,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
