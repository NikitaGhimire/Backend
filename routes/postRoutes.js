//Fetches all posts that are marked as published.
//This route is protected by JWT authentication.

const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
require("dotenv").config();

//fetch all posts
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const posts = await prisma.post.findMany({
      include: {
        comments: true,
        author: {
          // Include author details
          select: {
            username: true, // Only select the username field
          },
        },
      },
    });
    res.json(posts);
  }
);

//fetch specific post by id
router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { id } = req.params;
    try {
      const post = await prisma.post.findUnique({
        where: { id: parseInt(id) },
        include: { comments: true, author: true },
      });
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (err) {
      res.status(500).json({ error: "Error fetching post" });
    }
  }
);

//create a  new post (Author only)
router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { title, content, published } = req.body;
    const authorId = req.user.id;
    try {
      const newPost = await prisma.post.create({
        data: {
          title,
          content,
          published: published || false,
          authorId,
        },
      });
      res.status(201).json(newPost);
    } catch (err) {
      res.status(500).json({ error: "Error creating post" });
    }
  }
);

//update post
router.put(
  "/update/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { id } = req.params;
    const { title, content, published } = req.body;
    try {
      const post = await prisma.post.findUnique({
        where: { id: parseInt(id) },
      });
      if (!post) {
        return res.status(404).json({
          error: "Post not found",
        });
      }

      //ensure the post belongs to the author
      if (post.authorId !== req.user.id) {
        return res
          .status(403)
          .json({ error: "'Unauthorized to update this post" });
      }

      const updatedPost = await prisma.post.update({
        where: { id: parseInt(id) },
        data: { title, content, published },
      });

      res.json(updatedPost);
    } catch (err) {
      res.status(500).json({ error: "Error updating post" });
    }
  }
);

//delete a post
router.delete(
  "/delete/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { id } = req.params;

    try {
      const post = await prisma.post.findUnique({
        where: { id: parseInt(id) },
      });
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      // Ensure the post belongs to the author
      if (post.authorId !== req.user.id) {
        return res
          .status(403)
          .json({ error: "Unauthorized to delete this post" });
      }

      await prisma.post.delete({ where: { id: parseInt(id) } });
      res.json({ message: "Post deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: "Error deleting post" });
    }
  }
);

module.exports = router;
