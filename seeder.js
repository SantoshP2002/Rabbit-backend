const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./model/Product");
const User = require("./model/UserModel");
const Cart = require("./model/Cart");
const Products = require("./data/products");

dotenv.config();

// Connect To MongoDB
mongoose.connect(process.env.MONGO_URI);

// Function To Seed Data

const seedData = async () => {
  try {
    // Clear existing data
    await Product.deleteMany();
    await User.deleteMany();
    await Cart.deleteMany();

    // Create a default admin User
    const createdUser = await User.create({
      name: "Santosh Pawar",
      email: "santosh@gmail.com",
      password: "santosh123",
      role: "admin",
    });

    // Assigned the default user ID to each Product
    const userID = createdUser._id;
    const sampleProducts = Products.map((product) => {
      return { ...product,user: userID };
    });

    // Insert the product into the database
    await Product.insertMany(sampleProducts);
    console.log("Product data seeded successfully");
    process.exit();
  } catch (error) {
      console.error("Error seeding the data:", error);
      process.exit(1);
  }
};

seedData();