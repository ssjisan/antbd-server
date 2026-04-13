const express = require("express");
const router = express.Router();
const { requiredSignIn } = require("../middlewares/authMiddleware.js");
const {
  clientDataHandler,
  getAllClients,
  getClientById,
  deleteClientById,
} = require("../controller/clientController.js");

// Memory storage for image uploads
const upload = require("../middlewares/upload.js");
const { checkPermission } = require("../middlewares/checkPermission.js");

router.post(
  "/client-handle",
  requiredSignIn,
  checkPermission("client", "canCreate"),
  upload("clients").single("image"),
  clientDataHandler,
);

router.get("/clients", getAllClients);
router.get(
  "/client/:id",
  requiredSignIn,
  checkPermission("client", "canView"),
  getClientById,
);
router.delete(
  "/client-delete/:id",
  requiredSignIn,
  checkPermission("client", "canDelete"),
  deleteClientById,
);

module.exports = router;
