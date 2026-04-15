const express = require("express");
const router = express.Router();
const multer = require("multer");
const { requiredSignIn } = require("../middlewares/authMiddleware.js");
const {
  createOrUpdateArea,
  listAreas,
  deleteArea,
  readArea,
} = require("../controller/areaController.js");

// Memory storage for image uploads
const upload = require("../middlewares/upload.js");
const { checkPermission } = require("../middlewares/checkPermission.js");

// Create or update area (image is optional)
router.post(
  "/save-area",
  requiredSignIn,
  upload("coverage-area").single("file"),
  checkPermission("add-coverage", "canCreate"),
  createOrUpdateArea,
);
router.get("/areas", listAreas);
router.delete(
  "/area/:areaId",
  requiredSignIn,
  checkPermission("coverage-list", "canDelete"),
  deleteArea,
);
router.get("/area/:areaId", readArea);

module.exports = router;
