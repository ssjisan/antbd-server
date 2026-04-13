const express = require("express");
const router = express.Router();
const { dashboardController } = require("../controller/dashboardController.js");

// 1. Static route for total coverage — no ID needed
router.get("/summary", dashboardController);

module.exports = router;
