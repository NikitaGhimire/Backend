const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
require("dotenv").config();

//add a comment to a post(authenticated users)
router.post(
  "/add",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { content, postId } = req.body;
    const userId = req.user.id; // Get user ID from the authenticated user

    try {
      const comment = await prisma.comment.create({
        data: {
          content,
          postId,
          userId,
          username: req.user.username, // Assuming the user object has a username field
        },
      });
      res.status(201).json(comment);
    } catch (err) {
      res.status(500).json({ error: "Error adding comment" });
    }
  }
);

// Delete a comment (authenticated users only)
router.delete(
  "/delete/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id; // Get user ID from the authenticated user

    try {
      // Find the comment by ID
      const comment = await prisma.comment.findUnique({
        where: { id: parseInt(id) },
      });

      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      // Check if the comment belongs to the user
      if (comment.userId !== userId) {
        return res
          .status(403)
          .json({ error: "Unauthorized to delete this comment" });
      }

      // Delete the comment
      await prisma.comment.delete({ where: { id: parseInt(id) } });
      res.json({ message: "Comment deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: "Error deleting comment" });
    }
  }
);

// Route to get comments for a specific post
router.get(
  "/:postId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { postId } = req.params;

    try {
      const comments = await prisma.comment.findMany({
        where: { postId: parseInt(postId) },
      });
      res.json(comments);
    } catch (err) {
      res.status(500).json({ error: "Error fetching comments" });
    }
  }
);

module.exports = router;
