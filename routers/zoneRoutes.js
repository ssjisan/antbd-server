const express = require("express");
const router = express.Router();
const {
  createZone,
  getZones,
  updateZone,
  deleteZone,
} = require("../controller/zoneController");
const { requiredSignIn } = require("../middlewares/authMiddleware");
const { checkPermission } = require("../middlewares/checkPermission");

router.post(
  "/zones",
  requiredSignIn,
  checkPermission("add-zone", "canCreate"),
  createZone,
);
router.get("/zones", getZones);
router.put(
  "/zones/:id",
  requiredSignIn,
  checkPermission("add-zone", "canUpdate"),
  updateZone,
);
router.delete(
  "/zones/:id",
  requiredSignIn,
  checkPermission("add-zone", "canDelete"),
  deleteZone,
);

module.exports = router;
