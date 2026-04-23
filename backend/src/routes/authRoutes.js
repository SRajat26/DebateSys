const express = require("express");
const {
  registerUser,
  loginUser,
  getUserProfile,
  getPendingUsers,
  approveUser,
} = require("../controllers/authController");
const { protect, adminOC } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);

// OC Routes for user approval
router.get("/pending", protect, adminOC, getPendingUsers);
router.put("/approve/:id", protect, adminOC, approveUser);

module.exports = router;
