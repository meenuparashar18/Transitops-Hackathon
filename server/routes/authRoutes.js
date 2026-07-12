const express = require("express");
const router = express.Router();

// Controller import (later)
// const authController = require("../controllers/authController");

// Authentication Routes

// Register User
router.post("/register");

// Login User
router.post("/login");

// Logout User
router.post("/logout");

// Get Logged-in User Profile
router.get("/profile");

module.exports = router;