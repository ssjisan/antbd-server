const Slider = require("../model/sliderModel.js");
const fs = require("fs");
const path = require("path");

const BASE_URL = process.env.BASE_URL || "http://localhost:8000";
const STORAGE_PATH = process.env.STORAGE_PATH || "./uploads";
const FOLDER = "slider";

// ----------------------------------------------------------- //
// ------------------ Create / Update Slider ------------------ //
// ----------------------------------------------------------- //

const createOrUpdateSlider = async (req, res) => {
  try {
    const { title, publishStatus, order, id } = req.body;
    const file = req.file;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    let imageUrl = null;

    // If new image uploaded
    if (file) {
      imageUrl = `${BASE_URL}/file-storage/${FOLDER}/${file.filename}`;
    }

    // UPDATE
    if (id) {
      const existing = await Slider.findById(id);
      if (!existing) {
        return res.status(404).json({ error: "Slider not found" });
      }

      // Delete old image if new one uploaded
      if (file && existing.coverPhoto?.url) {
        const oldFile = existing.coverPhoto.url.split(`/${FOLDER}/`)[1];
        const oldPath = path.join(STORAGE_PATH, FOLDER, oldFile);

        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      existing.title = title;
      existing.publishStatus = publishStatus ?? existing.publishStatus;
      existing.order = order ?? existing.order;

      if (imageUrl) {
        existing.coverPhoto = { url: imageUrl };
      }

      const updated = await existing.save();

      return res.status(200).json({
        message: "Slider updated successfully",
        slider: updated,
      });
    }

    // CREATE
    if (!file) {
      return res.status(400).json({ error: "Cover image is required" });
    }

    const newSlider = await Slider.create({
      title,
      publishStatus: publishStatus ?? false,
      order: order ?? 0,
      coverPhoto: { url: imageUrl },
    });

    return res.status(201).json({
      message: "Slider created successfully",
      slider: newSlider,
    });
  } catch (err) {
    console.error("Slider save error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ----------------------------------------------------------- //
// ---------------------- List All Sliders -------------------- //
// ----------------------------------------------------------- //

const listSliders = async (req, res) => {
  try {
    const sliders = await Slider.find().sort({ order: 1, createdAt: -1 });
    res.json(sliders);
  } catch (err) {
    console.error("Slider list error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ----------------------------------------------------------- //
// ---------------------- Get Single Slider ------------------- //
// ----------------------------------------------------------- //

const getSlider = async (req, res) => {
  try {
    const { id } = req.params;

    const slider = await Slider.findById(id);
    if (!slider) {
      return res.status(404).json({ error: "Slider not found" });
    }

    res.json(slider);
  } catch (err) {
    console.error("Slider get error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ----------------------------------------------------------- //
// ------------------------ Delete Slider --------------------- //
// ----------------------------------------------------------- //

const deleteSlider = async (req, res) => {
  try {
    const { id } = req.params;

    const slider = await Slider.findById(id);
    if (!slider) {
      return res.status(404).json({ error: "Slider not found" });
    }

    // Delete image file
    if (slider.coverPhoto?.url) {
      const fileName = slider.coverPhoto.url.split(`/${FOLDER}/`)[1];
      const filePath = path.join(STORAGE_PATH, FOLDER, fileName);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Slider.findByIdAndDelete(id);

    res.json({ message: "Slider deleted successfully" });
  } catch (err) {
    console.error("Slider delete error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createOrUpdateSlider,
  listSliders,
  getSlider,
  deleteSlider,
};
