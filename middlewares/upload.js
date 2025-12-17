const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Disk storage configuration
const storage = multer.diskStorage({
  destination: "/var/www/file-storage", // VPS folder
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

// File filter & limits
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files allowed"));
  },
});

module.exports = upload;
