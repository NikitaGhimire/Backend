const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

router.post("/register", async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    // Validate input
    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Ensure role is in uppercase and matches enum values
    const validRole = role.toUpperCase(); // Convert role to uppercase

    // Check if role is valid
    if (!["USER", "AUTHOR"].includes(validRole)) {
      return res.status(400).json({ error: "Invalid role." });
    }
    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: validRole,
      },
    });

    res.status(201).json(user);
  } catch (err) {
    console.error(err); // Log the error
    res.status(500).json({ error: "Error registering user." });
  }
});

//handle user login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        {
          id: user.id,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      res.json({ token });
    } else {
      res.status(401).json({ error: "Invalid credentials " });
    }
  } catch (err) {
    res.status(500).json({ error: `Error logging in` });
  }
});

module.exports = router;
