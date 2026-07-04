const express = require("express");
const sendMail = require("../controller/mailController.js");

const router = express.Router();

router.post("/send-mail", sendMail);

module.exports = router;
