const mongoose = require("mongoose");

const requestConnectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
    },
    zone: {
      type: String,
      required: true,
    },
    area: {
      type: String,
      required: true,
    },
    fullAddress: {
      type: String,
      required: true,
    },
    areaInfo: {
      areaName: String,
      lat: Number,
      lng: Number,
      zoneName: String,
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    remarks: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const ConnectionRequest = mongoose.model(
  "ConnectionRequest",
  requestConnectionSchema
);

module.exports = ConnectionRequest;
