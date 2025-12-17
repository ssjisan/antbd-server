const Client = require("../model/clientModel.js");
require("dotenv").config(); // Load env vars
const path = require("path");
const fs = require("fs");

// Add client data with image upload
// const clientDataHandler = async (req, res) => {
//   try {
//     const { id, name } = req.body;

//     if (!name) return res.status(400).json({ error: "Name is required" });

//     const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
//     if (req.file && !allowedTypes.includes(req.file.mimetype)) {
//       return res.status(400).json({
//         error: "Only PNG, JPG, or WEBP image formats are allowed",
//       });
//     }

//     if (req.file) {
//       const fileSizeInBytes = req.file.size;
//       const oneMB = 1 * 1024 * 1024;
//       if (fileSizeInBytes > oneMB) {
//         return res.status(400).json({ error: "Image must be less than 1MB" });
//       }
//     }

//     if (id) {
//       // Update existing client
//       const client = await Client.findById(id);
//       if (!client) {
//         return res.status(404).json({ error: "Client not found" });
//       }

//       // If new image uploaded, delete old one and upload new one
//       if (req.file) {
//         if (client.image?.public_id) {
//           await deleteClientLogo(client.image.public_id);
//         }
//         const imageResult = await uploadClientLogo(req.file.buffer);

//         client.name = name;
//         client.image = {
//           url: imageResult.url,
//           public_id: imageResult.public_id,
//         };
//       } else {
//         // No new image, update only name
//         client.name = name;
//       }

//       await client.save();

//       return res.status(200).json({ message: "Client updated", client });
//     } else {
//       // Create new client
//       if (!req.file) {
//         return res.status(400).json({ error: "Image is required" });
//       }

//       const imageResult = await uploadClientLogo(req.file.buffer);

//       const client = await Client.create({
//         name,
//         image: {
//           url: imageResult.url,
//           public_id: imageResult.public_id,
//         },
//       });

//       return res.status(201).json({ message: "Client added", client });
//     }
//   } catch (error) {
//     console.error("Client save failed:", error.message);
//     res.status(500).json({ error: "Server error" });
//   }
// };

const clientDataHandler = async (req, res) => {
  try {
    const { id, name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    if (!req.file && !id) {
      return res.status(400).json({ error: "Image is required" });
    }

    // Build public URL
    let imageUrl = null;
    if (req.file) {
      imageUrl = `${process.env.BASE_URL}/file-storage/${req.file.filename}`;
    }

    // UPDATE
    if (id) {
      const client = await Client.findById(id);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      // delete old image if new uploaded
      if (req.file && client.image?.url) {
        const oldFile = client.image.url.split("/file-storage/")[1];
        const oldPath = `/var/www/file-storage/${oldFile}`;

        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      client.name = name;
      if (imageUrl) {
        client.image.url = imageUrl;
      }

      await client.save();
      return res.status(200).json({ message: "Client updated", client });
    }

    // CREATE
    const client = await Client.create({
      name,
      image: { url: imageUrl },
    });

    return res.status(201).json({ message: "Client added", client });
  } catch (error) {
    console.error("Client save failed:", error);
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
  deleteClientById,
};
