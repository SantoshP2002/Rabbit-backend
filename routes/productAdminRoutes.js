const express = require("express");
const Product = require("../model/Product");
const { protect, admin } = require("../middleware/authMiddleware");
const router = express.Router();

// @route GET /api/admin/products
// @desc Get all products (Admin Only)
// @access Private/Admin
router.get("/", protect, admin, async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).send("server Error");
    }
});

module.exports = router