const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

router.post("/register", async (req, res) => {
  try {
    console.log('Registration request body:', req.body);
    
    const { username, email, password, role } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: "Username, email and password are required" 
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: "Username or email already exists" 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: role || 'USER'
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json(userWithoutPassword);
  } catch (err) {
    console.error('Server error during registration:', err);
    res.status(500).json({ 
      error: "Registration failed",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
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
      res.json({ token, role: user.role });
    } else {
      res.status(401).json({ error: "Invalid credentials " });
    }
  } catch (err) {
    res.status(500).json({ error: `Error logging in` });
  }
});

module.exports = router;
