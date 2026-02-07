const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    emails: {
      type: [String], // specify that this is an array of strings
      default: [],
    },
    phoneNumbers: {
      type: [String], // array of strings
      default: [],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Contact", contactSchema);
