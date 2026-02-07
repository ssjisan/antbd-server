const Membership = require("../model/membershipModel.js");
require("dotenv").config(); // Load env vars
const path = require("path");
const fs = require("fs");

// Add client data with image upload

const membershipDataHandler = async (req, res) => {
  try {
    const { id, name, order } = req.body;

    if (!name) return res.status(400).json({ error: "Name is required" });
    if (!req.file && !id)
      return res.status(400).json({ error: "Image is required" });

    const storagePath = process.env.STORAGE_PATH || "./uploads";
    const baseUrl = process.env.BASE_URL || "http://localhost:8000";
    const FOLDER = "membership";

    // Build public URL
    let imageUrl = null;
    if (req.file) {
      imageUrl = `${baseUrl}/file-storage/${FOLDER}/${req.file.filename}`;
    }

    if (id) {
      // UPDATE
      const membership = await Membership.findById(id);
      if (!membership)
        return res.status(404).json({ error: "Membership not found" });

      // delete old image if new uploaded
      if (req.file && membership.image?.url) {
        const oldFile = membership.image.url.split("/file-storage/")[1];
        const oldPath = path.join(storagePath, oldFile);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      membership.name = name;
      if (imageUrl) membership.image.url = imageUrl;

      // Optional: allow order update if provided
      if (order !== undefined) membership.order = order;

      await membership.save();
      return res
        .status(200)
        .json({ message: "Membership updated", membership });
    }

    // CREATE: find max order and assign next
    const lastMembership = await Membership.findOne().sort({ order: -1 });
    const nextOrder = lastMembership ? lastMembership.order + 1 : 1;

    const membership = await Membership.create({
      name,
      image: { url: imageUrl },
      order: nextOrder,
    });

    return res.status(201).json({ message: "Membership added", membership });
  } catch (error) {
    console.error("Membership save failed:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all clients
const getAllMemberships = async (req, res) => {
  try {
    const memberships = await Membership.find().sort({ order: 1 }); // Optional: sorted by newest
    res.status(200).json(memberships);
  } catch (error) {
    console.error("Fetch all memberships failed:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Get single memberhisp by ID
const getMembershipById = async (req, res) => {
  try {
    const { id } = req.params;
    const membership = await Membership.findById(id);

    if (!membership) {
      return res.status(404).json({ error: "Membership not found" });
    }

    res.status(200).json(membership);
  } catch (error) {
    console.error("Fetch membership by ID failed:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete memberhisp by ID (and remove image from Cloudinary)
const deleteMembershipById = async (req, res) => {
  try {
    const { id } = req.params;

    const membership = await Membership.findById(id);
    if (!membership) {
      return res.status(404).json({ error: "Membership not found" });
    }

    // Delete image file from VPS/local storage
    if (membership.image?.url) {
      const storagePath = process.env.STORAGE_PATH || "./uploads";
      const filename = membership.image.url.split("/file-storage/")[1];
      const filePath = path.join(storagePath, filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // deletes the file
      }
    }

    // Delete client record from MongoDB
    await Membership.findByIdAndDelete(id);

    res.status(200).json({ message: "Membership deleted successfully" });
  } catch (error) {
    console.error("Delete Membership failed:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  membershipDataHandler,
  getAllMemberships,
  getMembershipById,
  deleteMembershipById,
};
