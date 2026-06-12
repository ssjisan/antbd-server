const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const BASE_STORAGE = process.env.STORAGE_PATH || "./uploads";
const baseUrl = process.env.BASE_URL || "http://localhost:8000";

const tempUploadController = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // ---------------- session handling ----------------
    const sessionId = req.body.sessionId || uuidv4();

    // temp folder path
    const tempFolder = path.join(BASE_STORAGE, "temp", sessionId);

    if (!fs.existsSync(tempFolder)) {
      fs.mkdirSync(tempFolder, { recursive: true });
    }

    // file already saved by multer → just move logically under session
    const fileName = file.filename;
    const newPath = path.join(tempFolder, fileName);

    // move file from default multer location → session folder
    fs.renameSync(file.path, newPath);

    // response
    return res.status(200).json({
      success: true,
      sessionId,
      image: {
        url: `${baseUrl}/uploads/temp/${sessionId}/${fileName}`,
        path: newPath,
        name: file.originalname,
        size: file.size,
      },
    });
  } catch (err) {
    console.error("Temp upload error:", err);
    res.status(500).json({ error: "Temp upload failed" });
  }
};

const deleteTempImage = async (req, res) => {
  try {
    const { sessionId, fileName } = req.body;

    if (!sessionId || !fileName) {
      return res.status(400).json({
        error: "sessionId and fileName are required",
      });
    }

    const filePath = path.join(BASE_STORAGE, "temp", sessionId, fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (err) {
    console.error("Delete temp image error:", err);
    res.status(500).json({ error: "Failed to delete image" });
  }
};

module.exports = { tempUploadController, deleteTempImage };
