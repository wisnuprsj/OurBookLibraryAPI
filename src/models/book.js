const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      trim: true,
    },
    selfLink: {
      type: String,
    },
    title: {
      type: String,
    },
    authors: {
      type: Array,
    },
    categories: {
      type: Array,
    },
    imageLinks: {
      type: Array,
    },
    possession: {
      type: String,
    },
    buyDate: {
      type: Date,
    },
    location: {
      type: String,
    },
  },
  { timestamps: true }
);

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;
