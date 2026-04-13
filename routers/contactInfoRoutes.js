const express = require("express");
const router = express.Router();
const { requiredSignIn } = require("../middlewares/authMiddleware.js");
const {
  createContact,
  getContacts,
  updateContact,
  deleteContact,
} = require("../controller/contactInfoController.js");
const { checkPermission } = require("../middlewares/checkPermission.js");

router.post(
  "/create-contact-info",
  requiredSignIn,
  checkPermission("contact-info", "canCreate"),
  createContact,
);
router.get("/contact-info", getContacts);
router.put(
  "/update-contact-info/:id",
  requiredSignIn,
  checkPermission("contact-info", "canUpdate"),
  updateContact,
);
router.delete(
  "/delete-contact-info/:id",
  requiredSignIn,
  (checkPermission("contact-info", "canDelete"), deleteContact),
);

module.exports = router;
