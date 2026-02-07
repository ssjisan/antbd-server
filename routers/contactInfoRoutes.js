const express = require("express");
const router = express.Router();
const { requiredSignIn } = require("../middlewares/authMiddleware.js");
const {
  createContact,
  getContacts,
  updateContact,
  deleteContact,
} = require("../controller/contactInfoController.js");

router.post("/create-contact-info", requiredSignIn, createContact);
router.get("/contact-info", getContacts);
router.put("/update-contact-info/:id", requiredSignIn, updateContact);
router.delete("/delete-contact-info/:id", requiredSignIn, deleteContact);

module.exports = router;
