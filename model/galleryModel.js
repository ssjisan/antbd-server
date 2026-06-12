const mongoose = require("mongoose");

const albumSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    order: {
      type: Number,
      default: 0,
    },

    // Folder path for this album (VERY useful)
    folder: {
      type: String, // e.g. uploads/albums/my-album-abc123
      required: true,
    },

    images: [
      {
        url: { type: String, required: true }, // for frontend
        path: { type: String, required: true }, // for server (delete/zip)
        name: { type: String, required: true },
        size: { type: Number, required: true },
        order: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Albums", albumSchema);
