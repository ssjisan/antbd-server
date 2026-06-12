const { exec } = require("child_process");
const fs = require("fs-extra");
const path = require("path");
const archiver = require("archiver");

const backupDir = path.join(__dirname, "../backups");

const STORAGE_PATH = process.env.STORAGE_PATH || "/var/www/file-storage";

fs.ensureDirSync(backupDir);

const createBackup = async (req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    const mongoDumpPath = path.join(backupDir, `mongo-${timestamp}`);
    const zipPath = path.join(backupDir, `backup-${timestamp}.zip`);

    // 1️⃣ MongoDB Backup
    const mongoCmd = `mongodump --uri="${process.env.MONGO_URI}" --out="${mongoDumpPath}"`;

    await new Promise((resolve, reject) => {
      exec(mongoCmd, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    // 2️⃣ Create ZIP
    await new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver("zip", { zlib: { level: 9 } });

      output.on("close", resolve);
      archive.on("error", reject);

      archive.pipe(output);

      // MongoDB dump
      archive.directory(mongoDumpPath, "database");

      // File storage
      archive.directory(STORAGE_PATH, "files");

      archive.finalize();
    });

    // 3️⃣ Cleanup mongo dump
    await fs.remove(mongoDumpPath);

    // 4️⃣ Download ZIP immediately
    res.download(zipPath, `backup-${timestamp}.zip`, async (err) => {
      if (err) {
        console.error("Download error:", err);
      }

      // optional cleanup after download
      setTimeout(
        async () => {
          await fs.remove(zipPath);
        },
        5 * 60 * 1000,
      ); // delete after 5 min
    });
  } catch (error) {
    console.error("Backup Error:", error);
    return res.status(500).json({
      success: false,
      message: "Backup failed",
      error: error.message,
    });
  }
};

module.exports = {
  createBackup,
};
