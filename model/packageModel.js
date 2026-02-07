const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema(
  {
    packageName: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    maxDownloadSpeed: {
      type: Number,
      required: true,
    },
    maxUploadSpeed: {
      type: Number,
      required: true,
    },
    connectionType: {
      type: [Number], // 0 = CAT-5, 1 = Fiber
      required: true,
      validate: {
        validator: function (val) {
          return val.every((type) => type === 0 || type === 1);
        },
        message: "Invalid connection type",
      },
    },
    setupCharge: {
      type: Number,
      required: true,
      default: 0,
    },
    popUp: {
      type: Boolean,
      default: false,
    },
    specialPackages: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Package = mongoose.model("Package", packageSchema);
module.exports = Package;
