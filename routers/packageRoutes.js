const express = require("express");
const router = express.Router();
const {
  createUpdatePackage,
  listAllPackages,
  listPopUpPackages,
  deletePackage,
  readPackage
} = require("../controller/packageController.js");

router.post("/create-package", createUpdatePackage);
router.get("/all-packages", listAllPackages);
router.get("/popup-packages", listPopUpPackages);
router.delete("/package/:id", deletePackage);
router.get("/package/:packageId", readPackage);

module.exports = router;
