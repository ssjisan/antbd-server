const express = require("express");
const router = express.Router();
const multer = require("multer");
const { requiredSignIn } = require("../middlewares/authMiddleware.js");
const {
  clientDataHandler,
  getAllClients,
  getClientById,
  deleteClientById
} = require("../controller/clientController.js");

// Memory storage for image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/client-handle",
  requiredSignIn,
  upload.single("image"),
  clientDataHandler
);
router.get("/clients", getAllClients);
router.get("/client/:id", requiredSignIn, getClientById);
router.delete("/client-delete/:id", deleteClientById);

module.exports = router;
