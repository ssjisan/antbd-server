const mongoose = require("mongoose");

const merbershipSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: {
      url: String,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("MemberShip", merbershipSchema);
