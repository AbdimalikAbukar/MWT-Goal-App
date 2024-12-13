const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  renderResetPasswordPage,
} = require("../controllers/auth");

// Render Login Form
router.get("/login", (req, res) => {
  res.render("login", { title: "Login", errors: null });
});

// Login Route
router.post("/login", loginUser);

// Render Registration Form
router.get("/register", (req, res) => {
  res.render("register", { title: "Register", errors: null });
});

// Registration Route
router.post("/register", registerUser);

// Forgot Password Route
router.get("/forgot-password", (req, res) => {
  res.render("forgot-password", { title: "Forgot Password", errors: null });
});

// Forgot Password Route
router.post("/forgot-password", forgotPassword);

// Render Reset Password Page
router.get("/reset-password/:token", renderResetPasswordPage);

// Reset Password
router.post("/reset-password", resetPassword);

// Render Not Logged In Page
router.get("/not-logged-in", (req, res) => {
  res.render("not_logged_in", { title: "Not Logged In" });
});

module.exports = router;
