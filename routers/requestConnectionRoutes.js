const express = require("express");
const router = express.Router();
const {
  checkAvailability,
  createConnectionRequest,
} = require("../controller/requestConnectionController.js");

router.post("/check-availability", checkAvailability);
router.post("/connection-request", createConnectionRequest);

module.exports = router;
