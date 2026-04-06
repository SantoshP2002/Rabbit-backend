const mongoose = require("mongoose");

const ShopSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    address: String,
    logo: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Shop", ShopSchema);
