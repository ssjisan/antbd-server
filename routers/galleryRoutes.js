const express = require("express");
const router = express.Router();

const uploadTemp = require("../middlewares/createUploader");
const {
  tempUploadController,
  deleteTempImage,
} = require("../controller/galleryController");

// ---------------------------
// TEMP IMAGE UPLOAD API
// ---------------------------
router.post(
  "/gallery/temp-upload",
  uploadTemp.single("image"),
  tempUploadController,
);
router.delete("/gallery/temp-delete", deleteTempImage);
module.exports = router;
