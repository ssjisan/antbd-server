const Area = require("../model/areaModel.js");
const cloudinary = require("cloudinary").v2;
require("dotenv").config(); // Load env vars

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Upload image to Cloudinary
const uploadLocationImage = async (imageBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "antbd/locations",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
          });
        }
      }
    );
    stream.end(imageBuffer);
  });
};

// Delete image from Cloudinary
const deleteLocationImage = async (public_id) => {
  if (!public_id) return;
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (err) {
    console.error("Failed to delete image from Cloudinary:", err.message);
  }
};

// Create or update area
const createOrUpdateArea = async (req, res) => {
  try {
    const { areaName, zone, address, polygons, id } = req.body;
    const file = req.file;

    if (!areaName || !zone || !address || !polygons) {
      return res.status(400).json({
        error: "Area name, zone, address, and map polygons are required",
      });
    }

    const parsedPolygons = JSON.parse(polygons);
    let imageData = null;

    // Upload new image if provided
    if (file) {
      const buffer = file.buffer;
      imageData = await uploadLocationImage(buffer);
    }

    if (id) {
      const existing = await Area.findById(id);
      if (!existing) return res.status(404).json({ error: "Area not found" });

      // If new image uploaded, delete the old one
      if (imageData && existing.coverPhoto?.public_id) {
        await deleteLocationImage(existing.coverPhoto.public_id);
      }

      // Update fields
      existing.areaName = areaName;
      existing.zone = zone;
      existing.address = address;
      existing.polygons = parsedPolygons;

      if (imageData) {
        existing.coverPhoto = imageData;
      }

      const updated = await existing.save();
      return res.status(200).json({
        message: "Area updated successfully",
        area: updated,
      });
    }

    // Else, create new area
    const newArea = await Area.create({
      areaName,
      zone,
      address,
      polygons: parsedPolygons,
      ...(imageData && { coverPhoto: imageData }),
    });

    return res.status(201).json({
      message: "Area created successfully",
      area: newArea,
    });
  } catch (err) {
    console.error("Area save error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


// List all areas
const listAreas = async (req, res) => {
  try {
    const areas = await Area.find().sort({ createdAt: 1 });
    res.json(areas);
  } catch (err) {
    console.error("Area list error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Read single area
const readArea = async (req, res) => {
  try {
    const { areaId } = req.params;
    const area = await Area.findById(areaId);
    if (!area) return res.status(404).json({ error: "Area not found" });
    res.json(area);
  } catch (err) {
    console.error("Area read error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete area
const deleteArea = async (req, res) => {
  try {
    const { areaId } = req.params;
    const area = await Area.findByIdAndDelete(areaId);
    if (!area) return res.status(404).json({ error: "Area not found" });

    // Delete image from Cloudinary if exists
    if (area.coverPhoto?.public_id) {
      await deleteLocationImage(area.coverPhoto.public_id);
    }

    res.json({ message: "Area deleted successfully" });
  } catch (err) {
    console.error("Area delete error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createOrUpdateArea,
  listAreas,
  readArea,
  deleteArea,
};
