const express = require("express");
const router = express.Router();
const {
  checkAvailability,
  createConnectionRequest,
  getAllConnectionRequests,
  updateConnectionRequestStatus,
} = require("../controller/requestConnectionController.js");
const { requiredSignIn } = require("../middlewares/authMiddleware.js");
const { checkPermission } = require("../middlewares/checkPermission.js");

router.post("/check-availability", checkAvailability);
router.post("/connection-request", createConnectionRequest);
router.get(
  "/connection-requests",
  requiredSignIn,
  checkPermission("connection-request", "canView"),
  getAllConnectionRequests,
);
router.put(
  "/connection-request/:id/status",
  requiredSignIn,
  checkPermission("connection-request", "canUpdate"),
  updateConnectionRequestStatus,
);

module.exports = router;
