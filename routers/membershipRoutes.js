const express = require("express");
const router = express.Router();
const multer = require("multer");
const { requiredSignIn } = require("../middlewares/authMiddleware.js");
const {
  membershipDataHandler,
  getAllMemberships,
  getMembershipById,
  deleteMembershipById,
} = require("../controller/membershipController.js");

// Memory storage for image uploads
const upload = require("../middlewares/upload.js");

router.post(
  "/membership-handle",
  requiredSignIn,
  upload("membership").single("image"),
  membershipDataHandler,
);
router.get("/memberships", getAllMemberships);
router.get("/membership/:id", requiredSignIn, getMembershipById);
router.delete("/membership-delete/:id", requiredSignIn, deleteMembershipById);

module.exports = router;
