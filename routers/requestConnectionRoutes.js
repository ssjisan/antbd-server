const express = require("express");
const router = express.Router();
const {
  checkAvailability,
  createConnectionRequest,
  getAllConnectionRequests,
  updateConnectionRequestStatus
} = require("../controller/requestConnectionController.js");
const { requiredSignIn } = require("../middlewares/authMiddleware.js");

router.post("/check-availability", checkAvailability);
router.post("/connection-request", createConnectionRequest);
router.get("/connection-requests",requiredSignIn, getAllConnectionRequests);
router.put("/connection-request/:id/status",requiredSignIn, updateConnectionRequestStatus);

module.exports = router;
