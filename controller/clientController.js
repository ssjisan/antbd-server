const Client = require("../model/clientModel.js");
const cloudinary = require("cloudinary").v2;
require("dotenv").config(); // Load env vars

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Upload image to Cloudinary
const uploadClientLogo = async (imageBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "antbd/clients",
        transformation: [
          {
            width: 500,
            height: 500,
            crop: "pad", // or "limit" or "fit" depending on the behavior you want
          },
        ],
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
const deleteClientLogo = async (public_id) => {
  if (!public_id) return;
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (err) {
    console.error("Failed to delete image from Cloudinary:", err.message);
  }
};

// Add client data with image upload
const clientDataHandler = async (req, res) => {
  try {
    const { id, name } = req.body;

    if (!name) return res.status(400).json({ error: "Name is required" });

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (req.file && !allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        error: "Only PNG, JPG, or WEBP image formats are allowed",
      });
    }

    if (req.file) {
      const fileSizeInBytes = req.file.size;
      const oneMB = 1 * 1024 * 1024;
      if (fileSizeInBytes > oneMB) {
        return res.status(400).json({ error: "Image must be less than 1MB" });
      }
    }

    if (id) {
      // Update existing client
      const client = await Client.findById(id);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      // If new image uploaded, delete old one and upload new one
      if (req.file) {
        if (client.image?.public_id) {
          await deleteClientLogo(client.image.public_id);
        }
        const imageResult = await uploadClientLogo(req.file.buffer);

        client.name = name;
        client.image = {
          url: imageResult.url,
          public_id: imageResult.public_id,
        };
      } else {
        // No new image, update only name
        client.name = name;
      }

      await client.save();

      return res.status(200).json({ message: "Client updated", client });
    } else {
      // Create new client
      if (!req.file) {
        return res.status(400).json({ error: "Image is required" });
      }

      const imageResult = await uploadClientLogo(req.file.buffer);

      const client = await Client.create({
        name,
        image: {
          url: imageResult.url,
          public_id: imageResult.public_id,
        },
      });

      return res.status(201).json({ message: "Client added", client });
    }
  } catch (error) {
    console.error("Client save failed:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all clients
const getAllClients = async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 }); // Optional: sorted by newest
    res.status(200).json(clients);
  } catch (error) {
    console.error("Fetch all clients failed:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Get single client by ID
const getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findById(id);

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    res.status(200).json(client);
  } catch (error) {
    console.error("Fetch client by ID failed:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete client by ID (and remove image from Cloudinary)
const deleteClientById = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    // Delete image from Cloudinary
    if (client.image?.public_id) {
      await deleteClientLogo(client.image.public_id);
    }

    // Delete client from MongoDB
    await Client.findByIdAndDelete(id);

    res.status(200).json({ message: "Client deleted successfully" });
  } catch (error) {
    console.error("Delete client failed:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  clientDataHandler,
  getAllClients,
  getClientById,
  uploadClientLogo,
  deleteClientById,
  deleteClientLogo,
};
