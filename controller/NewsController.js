const fs = require("fs");
const path = require("path");
const News = require("../model/newsModel.js");

exports.createNews = async (req, res) => {
  try {
    const { title, contentJSON, contentHTML, uploadedImages = [] } = req.body;

    if (!title || !contentJSON || !contentHTML) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 1. Create the database record
    const news = await News.create({
      title,
      contentJSON,
      contentHTML,
    });

    const newsId = news._id.toString();

    const baseStoragePath = path.join(process.cwd(), "uploads");
    const tempFolder = path.join(baseStoragePath, "temp");
    const newsFolder = path.join(baseStoragePath, "news", newsId);

    console.log("Temp Folder Path:", tempFolder);
    console.log("Target News Folder:", newsFolder);

    // 2. Ensure destination folder exists
    if (!fs.existsSync(newsFolder)) {
      fs.mkdirSync(newsFolder, { recursive: true });
    }

    const imageUrls = extractImagePaths(contentHTML);
    let updatedHTML = contentHTML;
    let updatedJSON = JSON.parse(JSON.stringify(contentJSON));
    const movedFiles = [];

    // 3. Process and Physical Move
    for (const url of imageUrls) {
      if (url.includes("/temp/")) {
        const filename = path.basename(url);
        const oldPath = path.join(tempFolder, filename);
        const newPath = path.join(newsFolder, filename);

        if (fs.existsSync(oldPath)) {
          // THIS IS THE LINE THAT MOVES THE FILE
          fs.renameSync(oldPath, newPath);
          movedFiles.push(filename);
          console.log(`MOVED: ${filename} to ${newsFolder}`);
        } else {
          console.error(`FAILED TO MOVE: File not found at ${oldPath}`);
        }

        // Update URLs for the DB
        const newUrl = `${process.env.BASE_URL}/file-storage/news/${newsId}/${filename}`;
        updatedHTML = updatedHTML.split(url).join(newUrl);
      }
    }

    // 4. Update JSON structure URLs
    const updateJsonImages = (nodes) => {
      for (let node of nodes) {
        if (node.type === "image" && node.url && node.url.includes("/temp/")) {
          const filename = path.basename(node.url);
          node.url = `${process.env.BASE_URL}/file-storage/news/${newsId}/${filename}`;
        }
        if (node.children) updateJsonImages(node.children);
      }
    };
    updateJsonImages(updatedJSON);

    // 5. Cleanup: Delete unused temp uploads
    for (const file of uploadedImages) {
      if (!movedFiles.includes(file)) {
        const filePath = path.join(tempFolder, file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`CLEANED UP: ${file} from temp`);
        }
      }
    }

    // 6. Save final content
    news.contentHTML = updatedHTML;
    news.contentJSON = updatedJSON;
    await news.save();

    return res.status(201).json({
      message: "Article created successfully",
      news,
    });
  } catch (error) {
    console.error("News Creation Error:", error);
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
