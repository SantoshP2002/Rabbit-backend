const express = require("express");
const Checkout = require("../model/Checkout");
const Cart = require("../model/Cart");
const Product = require("../model/Product");
const Order = require("../model/Order");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

//@route POST /api/checkout
//@desc Create a new Checkout
//@access Private

// CREATE CHECKOUT
router.post("/", protect, async (req, res) => {
  const { checkoutItems, shippingAddress, paymentMethod, totalPrice } =
    req.body;

  if (!checkoutItems || checkoutItems.length === 0) {
    return res.status(400).json({ message: "No items in checkout" });
  }
  try {
    // create a new checkout session
    const newCheckout = await Checkout.create({
      user: req.user._id,  
      checkoutItems: checkoutItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      paymentsStatus: "pending",
      isPaid: false,
    });

    console.log(`Checkout created for user: ${req.user._id}`);
    res.status(201).json(newCheckout);
  } catch (error) {
    console.error(error);
    res.status(500).send("server Error");
  }
});

// @route PUT /api/checkout/:id
// @desc Update a Checkout to mark as paid after successful payment
// @access Private

// UPDATE CHECKOUT
router.put("/:id/pay", protect, async (req, res) => {
  const { paymentStatus, paymentDetails } = req.body;

  try {
    const checkout = await Checkout.findById(req.params.id);
    if (!checkout) {
      res.status(404).json({ message: "Checkout not found" });
    }
    if (paymentStatus === "paid") {
      checkout.isPaid = true;
      checkout.paymentStatus = paymentStatus;
      checkout.paymentDetails = paymentDetails;
      checkout.paidAt = Date.now();

      await checkout.save();
      res.status(200).json(checkout);
    } else {
      res.status(400).json({ message: "Payment not successful" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("server Error");
  }
});

// @route POST /api/checkout/:id/finalized
// @desc Finalized checkout and convert to an order after payments confirmation
// @access Private

// FINALIZE CHECKOUT
router.post("/:id/finalize", protect, async (req, res) => {
  try {
    const checkout = await Checkout.findById(req.params.id);
    if (!checkout) {
      res.status(404).json({ message: "Checkout not found" });
    } 
    if (checkout.isPaid && !checkout.isFinalized) {
      // create final order based on the checkout details
      const finalOrder = await Order.create({
        user: checkout.user,
        orderItems: checkout.checkoutItems,
        shippingAddress: checkout.shippingAddress,
        paymentMethod: checkout.paymentMethod,
        totalPrice: checkout.totalPrice,
        isPaid: true,
        paidAt: checkout.paidAt,
        isDelivered: false,
        paymentStatus: "paid",
        paymentDetails: checkout.paymentDetails,
      });
      //Mark the checkout as finalized
      checkout.isFinalized = true;
      checkout.finalizedAt = Date.now();
      await checkout.save();
      // Delete the cart associate with the User
      await Cart.findOneAndDelete({ user: checkout.user });
      res.status(200).json(finalOrder);
    } else if (checkout.isFinalized) {
      res.status(400).json({ message: "Checkout already finalized" });
    } else {
      res.status(400).json({ message: "Checkout is Not Paid" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("server Error");
  }
});

module.exports = router;
