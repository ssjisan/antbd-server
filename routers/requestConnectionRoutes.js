const express = require("express");
const router = express.Router();
const {
  checkAvailability,
  createConnectionRequest,
  getAllConnectionRequests
} = require("../controller/requestConnectionController.js");

router.post("/check-availability", checkAvailability);
router.post("/connection-request", createConnectionRequest);
router.get("/connection-requests", getAllConnectionRequests);

module.exports = router;
