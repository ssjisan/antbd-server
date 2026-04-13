const express = require("express");
const router = express.Router();

const {
  createOrUpdateSlider,
  listSliders,
  getSlider,
  deleteSlider,
} = require("../controller/sliderController");

const createUploader = require("../middlewares/upload");
const { requiredSignIn } = require("../middlewares/authMiddleware");
const { checkPermission } = require("../middlewares/checkPermission");
const upload = createUploader("slider");

// ----------------------------------------------------------- //
// ---------------------- Create / Update --------------------- //
// ----------------------------------------------------------- //

router.post(
  "/update-slider",
  upload.single("coverPhoto"),
  requiredSignIn,
  checkPermission("slider-settings", "canCreate"),
  createOrUpdateSlider,
);

// ----------------------------------------------------------- //
// ---------------------- Get All Sliders --------------------- //
// ----------------------------------------------------------- //

router.get("/all-sliders", requiredSignIn, listSliders);

// ----------------------------------------------------------- //
// ---------------------- Get Single Slider ------------------- //
// ----------------------------------------------------------- //

router.get("/slider/:id", requiredSignIn, getSlider);

// ----------------------------------------------------------- //
// ---------------------- Delete Slider ----------------------- //
// ----------------------------------------------------------- //

router.delete(
  "/slider/:id",
  requiredSignIn,
  checkPermission("slider", "canDelete"),
  deleteSlider,
);

module.exports = router;
