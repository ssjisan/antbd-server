// routes/articleRoutes.js
const express = require("express");
const router = express.Router();
const { createNews } = require("../controller/NewsController.js");

router.post("/create-news", createNews);

module.exports = router;
