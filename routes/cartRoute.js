const express = require("express");
const Cart = require("../model/Cart");
const Product = require("../model/Product");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

// Helper function to get a cart by userId or GuestId
const getCart = async (guestId, userId) => {
  if (userId) {
    return await Cart.findOne({ user: userId });
  } else if (guestId) {
    return await Cart.findOne({ guestId });
  }
  return null;
};

// @route POST /api/cart
// @desc Add a product to the cart for a guest or logged
// @access Public

// ADD TO CART
router.post("/", protect, async (req, res) => {
  const { productId, quantity, size, color, guestId, userId } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Determine if the user is logged in or a guest
    const cart = await getCart(guestId, userId);

    // if the cart exist, update it
    if (cart) {
      const productIndex = cart.products.findIndex(
        (p) =>
          p.productId.toString() === productId &&
          p.size === size &&
          p.color === color
      );
      if (productIndex > -1) {
        // if the product already exists, update the quantity
        cart.products[productIndex].quantity += Number(quantity);
      } else {
        // add new cart
        cart.products.push({
          productId,
          name: product.name,
          image: product.images[0]?.url || "",
          price: product.price,
          size,
          color,
          quantity,
        });
      }
      //  Recalculate the total Price

      cart.totalPrice = cart.products.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      await cart.save();
      return res.status(200).json(cart);
    } else {
      // create a new cart for the guest or user
      const newCart = await Cart.create({
        user: userId ? userId : undefined,
        guestId: guestId ? guestId : "guest_" + new Date().getTime(),
        products: [
          {
            productId,
            name: product.name,
            image: product.images[0].url,
            price: product.price,
            size,
            color,
            quantity,
          },
        ],
        totalPrice: product.price * quantity,
      });
      return res.status(200).json(newCart);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("server Error");
  }
});

//@route PUT api/cart
// @desc Update product in the cart for  a guest or logged-in User
// @access Public

// UPDATE CART
router.put("/", protect, async (req, res) => {
  const { productId, quantity, size, color, guestId, userId } = req.body;

  try {
    // check userId, guestId is there present
    let cart = await getCart(guestId, userId);

    if (!cart) return res.status(404).json({ message: "Cart not found" });
    // productIndex
    const productIndex = cart.products.findIndex(
      (p) =>
        p.productId.toString() === productId &&
        p.size === size &&
        p.color === color
    );

    if (productIndex > -1) {
      // Update Quantity
      if (quantity > 0) {
        cart.products[productIndex].quantity = quantity;
      } else {
        cart.products.splice(productIndex, 1); // Remove the product if quantity is 0
      }

      cart.totalPrice = cart.products.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      await cart.save();
      return res.status(200).json(cart);
    } else {
      res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("server Error");
  }
});

//@route DELETE api/cart
//@desc remove a product from the cart
//@access Public

// DELETE CART
router.delete("/", protect, async (req, res) => {
  const { productId, size, color, guestId, userId } = req.body;
  console.log("req.body", req.body);
  try {
    let cart = await getCart(guestId, userId);
    console.log("cart", cart);

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const productIndex = cart.products.findIndex(
      (p) =>
        p.productId.toString() === productId &&
        p.size === size &&
        p.color === color
    );

    if (productIndex > -1) {
      cart.products.splice(productIndex, 1);

      cart.totalPrice = cart.products.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      await cart.save();
      return res.status(200).json(cart);
    } else {
      return res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("server Error");
  }
});

// @route GET /api/cart
// @desc Get the cart for a guest or logged-in User
// @access Public

// GET CART
router.get("/", protect, async (req, res) => {
  const { userId, guestId } = req.query;
  console.log("req.query", req.query);

  try {
    const cart = await getCart(guestId, userId);
    if (cart) {
      res.status(200).json(cart);
    } else {
      return res.status(404).json({ message: "Cart not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("server Error");
  }
});

//@route POST api/cart/merge
//@desc merge guest cart into user cart on login
//@access Private

// MERGE CART
router.post("/merge", protect, async (req, res) => {
  const { guestId, userId } = req.body;

  try {
    // find the guest cart and user cart
    const guestCart = await Cart.findOne({ guestId });
    const userCart = await Cart.findOne({ user: req.user._id });

    if (guestCart) {
      if (guestCart.products.length === 0) {
        return res.status(404).json({ message: "Guest cart is empty" });
      }

      if (userCart) {
        guestCart.products.forEach((guestItem) => {
          const productIndex = userCart.products.findIndex(
            (item) =>
              item.productId.toString() === guestItem.productId.toString() &&
              item.size === guestItem.size &&
              item.color === guestItem.color
          );

          if (productIndex > -1) {
            // It is items exists in the user cart, update the quantity
            userCart.products[productIndex].quantity += guestItem.quantity;
          } else {
            // Otherwise, add the guest item to the cart
            userCart.products.push(guestItem);
          }
        });
        userCart.totalPrice = userCart.products.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0
        );

        await userCart.save();
        //Remove the guest cart after merging
        try {
          await Cart.findOneAndDelete({ guestId });
        } catch (error) {
          console.error("Error deleting guest Cart", error);
        }
        res.status(200).json(guestCart);
      } else {
        // If the user has no existing cart, assign  the guest cart  to the user
        guestCart.user = req.user._id;
        guestCart.guestId = undefined;
        await guestCart.save();
        res.status(200).json(guestCart);
      }
    } else {
      if (userCart) {
        // Guest cart has already been merged, return the user cart
        return res.status(200).json(userCart);
      }
      res.status(404).json({ message: "Guest cart not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("server Error");
  }
});
module.exports = router;
