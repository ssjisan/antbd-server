const express = require("express");
const router = express.Router();

// import controller
const {
  registerUserByAdmin,
  loginUser,
  removeUser,
  userList,
  changePassword,
  resetPassword,
  getSingleUser,
  updateUser,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resendForgotPasswordOtp,
  resetForgotPassword,
} = require("../controller/authController.js");

// import middleware
const { requiredSignIn } = require("../middlewares/authMiddleware.js");
const { checkPermission } = require("../middlewares/checkPermission.js");

router.post(
  "/register",
  requiredSignIn,
  checkPermission("users", "canCreate"),
  registerUserByAdmin,
);
router.post("/login", loginUser);
router.get(
  "/users",
  requiredSignIn,
  checkPermission("users", "canView"),
  userList,
);
router.get(
  "/user/:id",
  requiredSignIn,
  checkPermission("users", "canView"),
  getSingleUser,
);
router.delete(
  "/user/:id",
  requiredSignIn,
  checkPermission("users", "canDelete"),
  removeUser,
);
router.post("/change-password", requiredSignIn, changePassword);
router.post("/reset-password/:id", requiredSignIn, resetPassword);
router.put(
  "/user/:id",
  requiredSignIn,
  checkPermission("users", "canUpdate"),
  updateUser,
);

router.post("/forgot-password-otp", sendForgotPasswordOtp);
router.post("/resend-otp", resendForgotPasswordOtp);
router.post("/verify-otp", verifyForgotPasswordOtp);
router.post("/reset-forgot-password", resetForgotPassword);
router.get("/auth-check", requiredSignIn, (req, res) => {
  res.json({ ok: true });
});

module.exports = router;
