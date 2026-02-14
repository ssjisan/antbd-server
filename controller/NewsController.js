const fs = require("fs");
const path = require("path");
const News = require("../model/newsModel.js");

exports.createNews = async (req, res) => {
  try {
    const { title, contentJSON, contentHTML, uploadedImages = [] } = req.body;

    if (!title || !contentJSON || !contentHTML) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const news = await News.create({
      title,
      contentJSON,
      contentHTML,
    });

    const baseStoragePath = path.join(__dirname, "../file-storage");
    const tempFolder = path.join(baseStoragePath, "temp");
    const newsFolder = path.join(baseStoragePath, "news", news._id.toString());

    if (!fs.existsSync(newsFolder)) {
      fs.mkdirSync(newsFolder, { recursive: true });
    }

    const imageUrls = extractImagePaths(contentHTML);

    let updatedHTML = contentHTML;
    const usedTempFiles = [];

    for (const url of imageUrls) {
      if (url.includes("/temp/")) {
        const filename = path.basename(url);
        usedTempFiles.push(filename);

        const oldPath = path.join(tempFolder, filename);
        const newPath = path.join(newsFolder, filename);

        if (fs.existsSync(oldPath)) {
          fs.renameSync(oldPath, newPath);
        }

        const newUrl = `${process.env.BASE_URL}/file-storage/news/${news._id}/${filename}`;
        updatedHTML = updatedHTML.replace(url, newUrl);
      }
    }

    // ✅ SAFE CLEANUP: Only delete this user's unused uploads
    for (const file of uploadedImages) {
      if (!usedTempFiles.includes(file)) {
        const filePath = path.join(tempFolder, file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    news.contentHTML = updatedHTML;
    await news.save();

    return res.status(201).json({
      message: "Article created successfully",
      news,
    });
  } catch (error) {
    console.error(error);
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
