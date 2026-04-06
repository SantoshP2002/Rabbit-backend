const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRouter");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoute");
const checkoutRoutes = require("./routes/checkoutRoutes");
const orderRoutes = require("./routes/orderRoute");
const uploadRoutes = require("./routes/uploadRoutes");
const subscriberRoute = require("./routes/subscribeRoute");
const adminRoutes = require("./routes/adminRoutes");
const productAdminRoutes = require("./routes/productAdminRoutes");
const adminOrderRoutes = require("./routes/adminOrderRoutes");
const adminShopRoute = require("./routes/adminShopRoute");

dotenv.config();
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
  }),
);

const PORT = process.env.PORT || 3000;

// Connect To MongoDB
connectDB();

app.get("/", (req, res) => {
  res.send("WELCOME TO RABBIT API!");
});

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/subscribe", subscriberRoute);

// Admin Routes
app.use("/api/admin/users", adminRoutes);
app.use("/api/admin/products", productAdminRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/shop", adminShopRoute);

app.listen(PORT, () => {
  console.log(`Server is Running on http://localhost:${PORT}`);
});
