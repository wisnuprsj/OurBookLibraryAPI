const mongoose = require("mongoose");

const uri =
  "mongodb+srv://admin:admin@cluster0.r6zfg.mongodb.net/BookLibraryDB?retryWrites=true&w=majority";

const uri2 = "mongodb://127.0.0.1:27017/BookLibraryDB";

mongoose.connect(uri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});
