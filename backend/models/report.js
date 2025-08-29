const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  type: { type: String, required: true },
  neighborhood: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  photo: { type: String, default: null },
  status: { type: String, enum: ["pending", "approved"], default: "pending" },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Report", reportSchema);
