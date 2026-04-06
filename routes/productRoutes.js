const express = require("express");
const Product = require("../model/Product");
const { protect, admin } = require("../middleware/authMiddleware");
const { default: mongoose } = require("mongoose");

const router = express.Router();

// @route POST /api/product
// @desc Create a new Products
// @access Private/Admin

// CREATE PRODUCT
router.post("/", protect, admin, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      countInStock,
      category,
      brand,
      size,
      color,
      collections,
      material,
      gender,
      images,
      isFeature,
      isPublished,
      tags,
      dimensions,
      weight,
      sku,
    } = req.body;

    const product = new Product({
      name,
      description,
      price,
      discountPrice,
      countInStock,
      category,
      brand,
      size,
      color,
      collections,
      material,
      gender,
      images,
      isFeature,
      isPublished,
      tags,
      dimensions,
      weight,
      sku,
      user: req.user._id, // Reference to the admin user who created it
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error(error);
    res.status(500).send("server Error");
  }
});

// @route PUT /api/product/:id
// @desc Update an existing Products ID
// @access Private/Admin

// UPDATE PRODUCT
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      countInStock,
      category,
      brand,
      size,
      color,
      collections,
      material,
      gender,
      images,
      isFeature,
      isPublished,
      tags,
      dimensions,
      weight,
      sku,
    } = req.body;

    // Find Product by id
    const product = await Product.findById(req.params.id);
    console.log(product);

    if (product) {
      // Update Product Filed
      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price || product.price;
      product.discountPrice = discountPrice || product.discountPrice;
      product.countInStock = countInStock || product.countInStock;
      Product.category = category || product.category;
      product.brand = brand || product.brand;
      product.size = size || product.size;
      product;
      Product.color = color || product.color;
      product.collections = collections || product.collections;
      product.material = material || product.material;
      product.gender = gender || product.gender;
      product.images = images || product.images;
      product.isFeatured = isFeature || product.isFeatured;
      product.isPublished = isPublished || product.isPublished;
      product.tags = tags || product.tags;
      product.dimension = dimensions || product.dimension;
      product.wight = weight || product.wight;
      Product.sku = sku || product.sku;

      // save the updated product
      const updateProduct = await product.save();
      res.status(201).json(updateProduct);
    } else {
      res.status(404).json({ message: "Product Not Found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("server Error");
  }
});

// @route DELETE /api/product/:id
// @desc Delete a Products by ID
// @access Private/Admin

// DELETE PRODUCT
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    // Find the Product by ID
    const product = await Product.findById(req.params.id);

    if (product) {
      // Remove the product from DB
      await product.deleteOne();
      res.json({ message: "Product Deleted Successfully" });
    } else {
      res.status(404).json({ message: "Product Not Found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("server Error");
  }
});

// @route GET /api/products
// @desc Get all Products
// @access Public

router.get("/", async (req, res) => {
  try {
    const {
      collection,
      size,
      color,
      gender,
      minPrice,
      maxPrice,
      sortBy,
      search,
      category,
      material,
      brand,
      limit,
    } = req.query;

    let query = {};

    //Filter Logic
    if (collection && collection.toLocaleLowerCase() !== "all") {
      query.collections = collection;
    }
    if (category && category.toLocaleLowerCase() !== "all") {
      query.category = category;
    }
    if (material) {
      query.material = { $in: material.split(",") };
    }
    if (brand) {
      query.brand = { $in: brand.split(",") };
    }
    if (size) {
      query.sizes = { $in: size.split(",") };
    }
    if (color) {
      query.colors = { $in: color.split(",") };
    }
    if (gender) {
      query.gender = { $in: gender.split(",") };
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    let sort = {};

    //Sort Logic
    if (sortBy) {
      switch (sortBy) {
        case "priceAsc":
          sort = { price: 1 };
          break;
        case "priceDesc":
          sort = { price: -1 };
          break;
        case "popularity":
          sort = { rating: -1 };
          break;
        default:
          break;
      }
    }

    // fetch products and apply sorting and limit
    let products = await Product.find(query)
      .sort(sortBy)
      .limit(Number(limit) || 0);

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).send("server Error");
  }
});

// @route POST /api/products/best-seller
// @desc Retrieve the product with highest rating
// @access Public

// BESTSELLER
router.get("/best-seller", async (req, res) => {
  try {
    const bestSeller = await Product.findOne().sort({ rating: -1 });
    if (bestSeller) {
      res.json(bestSeller);
    } else {
      res.status(404).json({ message: "Best-Seller Not Found" });
    }
  } catch (error) {
    console.error("BESTSELLER ERROR 👉", error);
     res.status(500).send(error.message);
  }
});

//@route GET /api/products/new-arrivals
// @desc Retrieve the product with highest rating
// @access Public

// New Arrivals
router.get("/new-arrival", async (req, res) => {
  try {
    // fetch Latest 8 products
    const newArrivals = await Product.find().sort({ createdAt: -1 }).limit(8);
    res.json(newArrivals);
  } catch (error) {
    console.error(error);
    res.status(500).send("server Error");
  }
});

// @route GET /api/products/:id
// @desc Get a single Product by ID
// @access Public

// SINGLE PRODUCT
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product Not Found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("server Error");
  }
});

// @route GET /api/products/similar/:id
// @desc Retrieve similar products based on current's Products gender nad category
// @access Public

// SIMILAR PRODUCTS
router.get("/similar/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product Not Found" });
    }

    const similarProducts = await Product.find({
      _id: { $ne: new mongoose.Types.ObjectId(id) },
      category: product.category,
      gender: product.gender,
    }).limit(4);

    res.json(similarProducts);
  } catch (error) {
    console.error(error);
    res.status(500).send("server Error");
  }
});

module.exports = router;
