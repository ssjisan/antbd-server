const multer = require("multer");
const path = require("path");
const fs = require("fs");

const coverPath = path.join(process.cwd(), "uploads", "news", "cover-photos");

if (!fs.existsSync(coverPath)) {
  fs.mkdirSync(coverPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, coverPath);
  },
  filename: function (req, file, cb) {
    const uniqueName =
      "news-" + Date.now() + "-" + file.originalname.replace(/\s+/g, "-");
    cb(null, uniqueName);
  },
});

module.exports = multer({ storage });
