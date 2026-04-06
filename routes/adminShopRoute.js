const express = require("express");
const { protect, admin } = require("../middleware/authMiddleware");
const ShopModel = require("../model/AdminShop");
const Product = require("../model/Product");
const Order = require("../model/Order");
const User = require("../model/UserModel");

const router = express.Router();

// GET SHOP
router.get("/", protect, admin, async (req, res) => {
  try {
    let shop = await ShopModel.findOne();
    res.json(shop);
  } catch (error) {
    res.status(500).json({ message: "Just Get Server Error" });
  }
});

// UPDATE SHOP
router.put("/", protect, admin, async (req, res) => {
  try {
    let shop = await ShopModel.findOne();

    if (!shop) {
      shop = new ShopModel(req.body);
    } else {
      Object.assign(shop, req.body);
    }

    await shop.save();
    res.status(200).json({ message: "Shop Updated Successfully", shop });
  } catch (error) {
    console.error("Update Shop Error:", error);
    res.status(500).json({ message: "Shop update Server Error" });
  }
});

// GET STATS
router.get("/stats", protect, admin, async (req, res) => {
  try {
    const products = await Product.countDocuments();
    const orders = await Order.countDocuments();
    const users = await User.countDocuments();

    const revenueData = await Order.find({ isPaid: true });
    const revenue = revenueData.reduce((acc, item) => acc + item.totalPrice, 0);

    res.json({ products, orders, users, revenue });
  } catch (error) {
    res.status(500).json({ message: "Stats Get Server Error" });
  }
});

module.exports = router;
