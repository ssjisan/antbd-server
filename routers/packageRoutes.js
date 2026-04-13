const express = require("express");
const router = express.Router();
const {
  createUpdatePackage,
  listAllPackages,
  listPopUpPackages,
  deletePackage,
  readPackage,
} = require("../controller/packageController.js");
const { requiredSignIn } = require("../middlewares/authMiddleware.js");
const { checkPermission } = require("../middlewares/checkPermission.js");

router.post(
  "/create-package",
  requiredSignIn,
  checkPermission("add-package", "canCreate"),
  createUpdatePackage,
);
router.get("/all-packages", listAllPackages);
router.get("/popup-packages", listPopUpPackages);
router.delete(
  "/package/:id",
  requiredSignIn,
  checkPermission("package-list", "canDelete"),
  deletePackage,
);
router.get("/package/:packageId", requiredSignIn, readPackage);

module.exports = router;
