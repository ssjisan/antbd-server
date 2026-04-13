const express = require("express");
const router = express.Router();
const { requiredSignIn } = require("../middlewares/authMiddleware.js");
const {
  membershipDataHandler,
  getAllMemberships,
  getMembershipById,
  deleteMembershipById,
} = require("../controller/membershipController.js");

// Memory storage for image uploads
const upload = require("../middlewares/upload.js");
const { checkPermission } = require("../middlewares/checkPermission.js");

router.post(
  "/membership-handle",
  requiredSignIn,
  checkPermission("memberships", "canCreate"),
  upload("membership").single("image"),
  membershipDataHandler,
);
router.get("/memberships", getAllMemberships);
router.get(
  "/membership/:id",
  requiredSignIn,
  checkPermission("memberships", "canView"),
  getMembershipById,
);
router.delete(
  "/membership-delete/:id",
  requiredSignIn,
  checkPermission("memberships", "canDelete"),
  deleteMembershipById,
);

module.exports = router;
