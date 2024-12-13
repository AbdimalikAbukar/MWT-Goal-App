const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Register User
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Create a new user in the database
    const user = await User.create({ username, email, password });

    // Optionally, you can send a success message to the view (e.g., registration successful)
    res.status(201).redirect("/api/auth/login");
  } catch (err) {
    // If there was an error, render the login page with an error message
    res.render("login", { error: "Error registering user. Please try again." });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found " });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.redirect("/");
  } catch (err) {
    res.status(500).json({ err: "Error logging in user" });
  }
};
// Forgot Password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email not found" });

    const resetToken = Math.random().toString(36).substring(2, 15);
    const resetTokenExpiry = Date.now() + 3600000;
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    console.log(`Reset token for ${email}: ${resetToken}`);
    res.status(200).json({
      message: "Reset token sent to your email.",
    });
  } catch (err) {
    res.status(500).json({ err: "Error processing forgot password request" });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });
    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ err: "Error resetting password" });
  }
};

// Reset Password Page (GET) - render reset form
const renderResetPasswordPage = async (req, res) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });
    if (!user)
      return res.render("reset-password", {
        title: "Reset Password",
        errors: [{ msg: "Invalid or expired token." }],
        token: null,
      });

    res.render("reset-password", {
      title: "Reset Password",
      errors: null,
      token,
    });
  } catch (err) {
    res.render("reset-password", {
      title: "Reset Password",
      errors: [{ msg: "An error occurred." }],
      token: null,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  renderResetPasswordPage,
};
