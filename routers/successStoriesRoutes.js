const express = require("express");
const router = express.Router();
const {
  createSuccessStories,
  getAllSuccessStories,
  getLatestSuccessStories,
  getSuccessStoriesById,
  updateSuccessStories,
  deleteSuccessStories,
} = require("../controller/successStoriesController.js");
const { requiredSignIn } = require("../middlewares/authMiddleware.js");
const successStoriesCoverUpload = require("../middlewares/successStoriesCoverUpload.js");
const { checkPermission } = require("../middlewares/checkPermission.js");

router.post(
  "/create-story",
  successStoriesCoverUpload.single("coverPhoto"),
  requiredSignIn,
  checkPermission("success-stories-editor", "canCreate"),
  createSuccessStories,
);
router.get("/all-stories", getAllSuccessStories);
router.get("/latest-success-stories", getLatestSuccessStories);
router.get("/success-stories/:id", getSuccessStoriesById);
router.put(
  "/update-stories/:id",
  successStoriesCoverUpload.single("coverPhoto"),
  requiredSignIn,
  checkPermission("success-stories-editor", "canUpdate"),
  updateSuccessStories,
);
router.delete(
  "/delete-stories/:id",
  requiredSignIn,
  checkPermission("success-stories", "canDelete"),
  deleteSuccessStories,
);

module.exports = router;
