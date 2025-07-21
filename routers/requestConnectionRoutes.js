const express = require("express");
const router = express.Router();
const { checkAvailability } = require("../controller/requestConnectionController.js");

router.post("/check-availability", checkAvailability);

module.exports = router;
