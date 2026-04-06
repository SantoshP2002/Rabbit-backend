const express = require("express");
const Order = require("../model/Order");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

//@route Get /api/orders/my-orders
//@desc Get logged-in User's orders
//@access Private

//GET ORDER
router.get("/my-orders", protect, async (req, res) => {
  try {
    // Find order for the authenticated user
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    // Sort by most recent order
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).send("server Error");
  }
});

//@route Get /api/orders/:id
//@desc vGet order Details by ID
//@access Private
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );
    if (!order) {
      res.status(404).json({ message: "Order Not Found" });
    }
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).send("server Error");
  }
});

module.exports = router;
