const fs = require("fs");
const path = require("path");
const SuccessStories = require("../model/successStoriesModel.js");

const BASE_URL = process.env.BASE_URL || "http://localhost:8000";
const STORAGE_PATH = process.env.STORAGE_PATH || "./uploads";
const FOLDER = "success-stories";

exports.createSuccessStories = async (req, res) => {
  try {
    const { title } = req.body;

    // Because multipart/form-data
    const contentJSON = JSON.parse(req.body.contentJSON || "[]");
    const contentHTML = req.body.contentHTML;
    const uploadedImages = JSON.parse(req.body.uploadedImages || "[]");

    if (!title || !contentJSON || !contentHTML) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const baseStoragePath =
      process.env.STORAGE_PATH || path.join(process.cwd(), "uploads");
    const successStoriesBaseFolder = path.join(
      baseStoragePath,
      "success-stories",
    );
    const coverFolder = path.join(successStoriesBaseFolder, "cover-photos");
    const tempFolder = path.join(baseStoragePath, "temp");

    // ✅ Handle Cover Photo (Saved directly by multer)
    let coverPhotoUrl = "";

    if (req.file) {
      coverPhotoUrl = `${BASE_URL}/file-storage/${FOLDER}/cover-photos/${req.file.filename}`;
    }

    // 1️⃣ Create DB record first (including cover)
    const successStories = await SuccessStories.create({
      title,
      contentJSON,
      contentHTML,
      coverPhoto: coverPhotoUrl,
    });

    const successStoriesId = successStories._id.toString();
    const successStoriesFolder = path.join(
      successStoriesBaseFolder,
      successStoriesId,
    );

    // 2️⃣ Ensure news folder exists
    if (!fs.existsSync(successStoriesFolder)) {
      fs.mkdirSync(successStoriesFolder, { recursive: true });
    }
    if (!fs.existsSync(coverFolder)) {
      fs.mkdirSync(coverFolder, { recursive: true });
    }
    const imageUrls = extractImagePaths(contentHTML);
    let updatedHTML = contentHTML;
    let updatedJSON = JSON.parse(JSON.stringify(contentJSON));
    const movedFiles = [];

    // 3️⃣ Move editor images from temp → news/:id
    for (const url of imageUrls) {
      if (url.includes("/temp/")) {
        const filename = path.basename(url);
        const oldPath = path.join(tempFolder, filename);
        const newPath = path.join(successStoriesFolder, filename);

        if (fs.existsSync(oldPath)) {
          fs.renameSync(oldPath, newPath);
          movedFiles.push(filename);
          console.log(`MOVED: ${filename} → ${successStoriesFolder}`);
        } else {
          console.error(`File not found in temp: ${oldPath}`);
        }

        // Update HTML URL
        const successStoryUrl = `${BASE_URL}/file-storage/${FOLDER}/${successStoriesId}/${filename}`;
        updatedHTML = updatedHTML.split(url).join(successStoryUrl);
      }
    }

    // 4️⃣ Update JSON structure URLs
    const updateJsonImages = (nodes) => {
      for (let node of nodes) {
        if (node.type === "image" && node.url && node.url.includes("/temp/")) {
          const filename = path.basename(node.url);
          node.url = `${BASE_URL}/file-storage/${FOLDER}/${successStoriesId}/${filename}`;
        }
        if (node.children) updateJsonImages(node.children);
      }
    };

    updateJsonImages(updatedJSON);

    // 5️⃣ Cleanup unused temp uploads
    for (const file of uploadedImages) {
      // 🛑 Basic filename validation
      if (!file || file.includes("/") || file.includes("..")) {
        console.warn("Skipped invalid filename:", file);
        continue;
      }

      if (!movedFiles.includes(file)) {
        const filePath = path.join(tempFolder, file);

        if (fs.existsSync(filePath)) {
          const stat = fs.lstatSync(filePath);

          if (stat.isFile()) {
            fs.unlinkSync(filePath);
            console.log(`CLEANED TEMP: ${file}`);
          } else {
            console.warn(`Skipped non-file during cleanup: ${filePath}`);
          }
        }
      }
    }

    // 6️⃣ Save updated content
    successStories.contentHTML = updatedHTML;
    successStories.contentJSON = updatedJSON;
    await successStories.save();

    return res.status(201).json({
      message: "Success Stories created successfully",
      successStories,
    });
  } catch (error) {
    console.error("Success Stories Creation Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Helper function
function extractImagePaths(html) {
  const regex = /src="([^"]+)"/g;
  const matches = [];
  let match;

  while ((match = regex.exec(html)) !== null) {
    matches.push(match[1]);
  }

  return matches;
}

exports.getAllSuccessStories = async (req, res) => {
  try {
    const successStoriesList = await SuccessStories.find()
      .sort({ createdAt: -1 })
      .select("-contentJSON"); // optional: exclude heavy JSON for list view

    return res.status(200).json(successStoriesList);
  } catch (error) {
    console.error("Get all success stories Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getLatestSuccessStories = async (req, res) => {
  try {
    const latestSuccessStories = await SuccessStories.find()
      .sort({ createdAt: -1 }) // newest first
      .limit(5) // only latest 5
      .select("-contentJSON"); // optional: exclude heavy JSON

    return res.status(200).json(latestSuccessStories);
  } catch (error) {
    console.error("Get Latest News Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getSuccessStoriesById = async (req, res) => {
  try {
    const { id } = req.params;

    const successStories = await SuccessStories.findById(id);

    if (!successStories) {
      return res.status(404).json({ message: "Stories not found" });
    }

    return res.status(200).json(successStories);
  } catch (error) {
    console.error("Get News By ID Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.updateSuccessStories = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, contentJSON, contentHTML, uploadedImages = [] } = req.body;

    if (!title || !contentJSON || !contentHTML) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingSuccessStories = await SuccessStories.findById(id);
    if (!existingSuccessStories) {
      return res.status(404).json({ message: "News not found" });
    }

    const successStoriesId = existingSuccessStories._id.toString();
    const baseStoragePath =
      process.env.STORAGE_PATH || path.join(process.cwd(), "uploads");

    const tempFolder = path.join(baseStoragePath, "temp");
    const successStoriesFolder = path.join(
      baseStoragePath,
      "success-stories",
      successStoriesId,
    );
    const coverFolder = path.join(
      baseStoragePath,
      "success-stories",
      "cover-photos",
    );

    if (!fs.existsSync(successStoriesFolder))
      fs.mkdirSync(successStoriesFolder, { recursive: true });
    if (!fs.existsSync(coverFolder))
      fs.mkdirSync(coverFolder, { recursive: true });

    let updatedHTML = contentHTML;
    let updatedJSON = JSON.parse(JSON.stringify(contentJSON));
    const imageUrls = extractImagePaths(contentHTML);
    const movedFiles = [];

    // 🔹 1. Move new temp images
    for (const url of imageUrls) {
      if (url.includes("/temp/")) {
        const filename = path.basename(url);
        const oldPath = path.join(tempFolder, filename);
        const newPath = path.join(successStoriesFolder, filename);

        if (fs.existsSync(oldPath)) {
          fs.renameSync(oldPath, newPath);
          movedFiles.push(filename);
        }

        const successStoriesUrl = `${BASE_URL}/file-storage/${FOLDER}/${successStoriesId}/${filename}`;
        updatedHTML = updatedHTML.split(url).join(successStoriesUrl);
      }
    }

    // 🔹 2. Update JSON image URLs
    const updateJsonImages = (nodes) => {
      for (let node of nodes) {
        if (node.type === "image" && node.url && node.url.includes("/temp/")) {
          const filename = path.basename(node.url);
          node.url = `${BASE_URL}/file-storage/${FOLDER}/${successStoriesId}/${filename}`;
        }
        if (node.children) updateJsonImages(node.children);
      }
    };
    updateJsonImages(updatedJSON);

    // 🔹 3. Delete removed editor images from disk
    const existingImages = fs.existsSync(successStoriesFolder)
      ? fs.readdirSync(successStoriesFolder)
      : [];
    const currentImageFilenames = imageUrls.map((url) => path.basename(url));
    for (const file of existingImages) {
      if (!currentImageFilenames.includes(file)) {
        fs.unlinkSync(path.join(successStoriesFolder, file));
      }
    }

    // 🔹 4. Cleanup unused temp uploads
    for (const file of uploadedImages) {
      // 🛑 Basic filename validation
      if (!file || file.includes("/") || file.includes("..")) {
        console.warn("Skipped invalid filename:", file);
        continue;
      }

      if (!movedFiles.includes(file)) {
        const filePath = path.join(tempFolder, file);

        if (fs.existsSync(filePath)) {
          const stat = fs.lstatSync(filePath);

          if (stat.isFile()) {
            fs.unlinkSync(filePath);
            console.log(`CLEANED TEMP: ${file}`);
          } else {
            console.warn(`Skipped non-file during cleanup: ${filePath}`);
          }
        }
      }
    }

    // 🔹 5. Handle cover photo replacement
    if (req.file) {
      // Delete old cover if exists
      if (existingSuccessStories.coverPhoto) {
        const oldCoverFilename = path.basename(
          existingSuccessStories.coverPhoto,
        );
        const oldCoverPath = path.join(coverFolder, oldCoverFilename);
        if (fs.existsSync(oldCoverPath)) {
          fs.unlinkSync(oldCoverPath);
          console.log(`Deleted old cover: ${oldCoverFilename}`);
        }
      }

      // Save new cover URL
      existingSuccessStories.coverPhoto = `${BASE_URL}/file-storage/${FOLDER}/cover-photos/${req.file.filename}`;
    }

    // 🔹 6. Save final content
    existingSuccessStories.title = title;
    existingSuccessStories.contentHTML = updatedHTML;
    existingSuccessStories.contentJSON = updatedJSON;

    await existingSuccessStories.save();

    return res.status(200).json({
      message: "Success Story updated successfully",
      successStories: existingSuccessStories,
    });
  } catch (error) {
    console.error("Success Stories Update Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.deleteSuccessStories = async (req, res) => {
  try {
    const { id } = req.params;

    const existingSuccessStories = await SuccessStories.findById(id);
    if (!existingSuccessStories) {
      return res.status(404).json({ message: "Story not found" });
    }

    const successStoriesId = existingSuccessStories._id.toString();

    const baseStoragePath =
      process.env.STORAGE_PATH || path.join(process.cwd(), "uploads");

    const successStoriesFolder = path.join(
      baseStoragePath,
      "success-stories",
      successStoriesId,
    );
    const coverFolder = path.join(
      baseStoragePath,
      "success-stories",
      "cover-photos",
    );

    // 🔥 1️⃣ Delete editor images folder
    if (fs.existsSync(successStoriesFolder)) {
      fs.rmSync(successStoriesFolder, { recursive: true, force: true });
      console.log(`Deleted news folder: ${successStoriesFolder}`);
    }

    // 🔥 2️⃣ Delete cover photo file
    if (existingSuccessStories.coverPhoto) {
      const coverFilename = path.basename(existingSuccessStories.coverPhoto);
      const coverPath = path.join(coverFolder, coverFilename);

      if (fs.existsSync(coverPath)) {
        fs.unlinkSync(coverPath);
        console.log(`Deleted cover photo: ${coverFilename}`);
      }
    }

    // 🔥 3️⃣ Delete DB record
    await SuccessStories.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Story deleted successfully",
    });
  } catch (error) {
    console.error("Delete Story Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
