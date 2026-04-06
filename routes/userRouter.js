const express = require("express");
const User = require("../model/UserModel");
const jwt = require("jsonwebtoken");
const {protect} = require("../middleware/authMiddleware")

const router = express.Router();

// @route POST /api/users/register
// @desc Register a new user
//@access public

// REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // register logic
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User Already Exist" });

    user = new User({ name, email, password });
    await user.save();

    // Create JWT Payload
    const payload = { user: { id: user._id, role: user.role } };

    // Sign and return the generate token along with user data
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "140h" },
      (err, token) => {
        if (err) throw err;

        // send the user and token in response
        res.status(201).json({
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          message: "User Register Success",
          token,
        });
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).send("server error");
  }
});

// @route POST /api/users/login
// @desc Authenticate user
// Access Public

//LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find by user by email
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "Invalid Email" });
    
    const isMatch = await user.matchPassword(password);

    if (!isMatch) return res.status(400).json({ message: "Invalid Password" });

    // Create JWT Payload
    const payload = { user: { id: user._id, role: user.role } };

    // Sign and return the generate token along with user data
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "140h" },
      (err, token) => {
        if (err) throw err;

        // send the user and token in response
        res.status(201).json({
          user: {
            _id: user._id,
            email: user.email,
            role: user.role,
          },
          message: "User Login Success",
          token,
        });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("server Error");
  }
});


//@route GET /api/users/profile
//@desc get logged-in user's profile (protected route)
// @access private



//PROFILE
router.get("/profile",protect, async (req, res) => {
    res.json(req.user)  
})

module.exports = router;
