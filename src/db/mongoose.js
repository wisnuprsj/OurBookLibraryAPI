const mongoose = require("mongoose");
require("dotenv").config();

const uri = process.env.MONGODB_URI;
// const uri = process.env.MONGODB_URI_PROD;

// const uri2 = "mongodb://127.0.0.1:27017/BookLibraryDB";

mongoose.connect(uri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});
