const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
   googleLogin
} = require("../controllers/authController");

const protect = require("../middlewares/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/me", protect, getMe);

module.exports = router;
