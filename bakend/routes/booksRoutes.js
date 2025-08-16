// backend/routes/booksRoutes.js
const express = require("express");
const Book = require("../models/Book");
const IssuedBook = require("../models/IssuedBook");
const router = express.Router();

// Get all books
router.get("/", async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new book
router.post("/", async (req, res) => {
  try {
    const { title, author, image } = req.body;
    if (!title || !author || !image) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const newBook = new Book({ title, author, image });
    await newBook.save();
    res.json(newBook);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit / Update book
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, image } = req.body;

    if (!title || !author || !image) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const updatedBook = await Book.findByIdAndUpdate(
      id,
      { title, author, image },
      { new: true } // अपडेटेड डॉक्यूमेंट रिटर्न करे
    );

    if (!updatedBook) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json(updatedBook);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete book
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Book.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.json({ message: "Book deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get issued books
router.get("/issued", async (req, res) => {
  try {
    const { userEmail } = req.query;
    let query = {};
    if (userEmail) {
      query.userEmail = userEmail;
    }
    const issuedBooks = await IssuedBook.find(query).sort({ issueDate: -1 });
    res.json(issuedBooks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Issue books
router.post("/issued", async (req, res) => {
  try {
    const { books, userEmail } = req.body;
    if (!Array.isArray(books) || books.length === 0) {
      return res.status(400).json({ error: "Books must be a non-empty array" });
    }
    if (!userEmail) {
      return res.status(400).json({ error: "userEmail is required" });
    }
    const booksToInsert = books.map((b) => ({
      ...b,
      userEmail,
      issueDate: new Date(),
    }));
    const issuedBooks = await IssuedBook.insertMany(booksToInsert);
    res.status(201).json(issuedBooks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Return issued book
router.delete("/issued/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await IssuedBook.findByIdAndDelete(id);
    res.json({ message: "Book returned successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
