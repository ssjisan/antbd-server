const mongoose = require("mongoose");

const sliderSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    coverPhoto: {
      url: {
        type: String,
        required: true,
      },
    },

    publishStatus: {
      type: Boolean,
      default: false,
    },

    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Slider", sliderSchema);
