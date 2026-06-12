const express = require("express");
const router = express.Router();
const { createBackup } = require("../controller/backup.js");

router.get("/backup/download", createBackup);

module.exports = router;
