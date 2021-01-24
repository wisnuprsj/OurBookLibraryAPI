// DOTENV
require("dotenv").config();

// IMPORT LIBRARY
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

// IMPORT MODULE
require("./db/mongoose");

// VARIABLES
const port = process.env.PORT || 3000;

// INITIALIZATION
const app = express();

// FOR CORS MODE (ISSUE RUNNING LOCALLY AND FETCH BY REACT)
let allowCrossDomain = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
};

// EXPRESS CONFIG
app.use(allowCrossDomain);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//// CREDENTIALS KEY
// GOOGLE BOOKS API KEY
const googleKey = process.env.GOOGLEKEY;

// MONGODB MODEL
const Book = require("./models/book");
const User = require("./models/user");
const ParaDomain = require("./models/paradomain");
const Genre = require("./models/genre");

// ENDPOINT
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// BOOK
app.post("/addbook", async (req, res) => {
  let data = req.body;
  let user = await ParaDomain.find(
    { domainId: process.env.DOMAIN_LST_USER },
    (err, lstUser) => {
      if (err) {
        console.log(err);
      } else {
        return lstUser[0].data;
      }
    }
  );
  let newData = {
    id: data.id ? data.id : "",
    selfLink: data.selfLink ? data.selfLink : "",
    title: data.title ? data.title : "",
    authors: data.authors ? data.authors : [],
    categories: data.categories ? data.categories : [],
    imageLinks: data.imageLinks ? data.imageLinks : [],
    possession: data.possession ? data.possession : user[0].fullName,
    buyDate: data.buyDate ? data.buyDate : Date.now(),
    location: data.location,
  };

  let myData = new Book(newData);

  myData
    .save()
    .then((item) => {
      res.send(myData);
    })
    .catch((err) => {
      res.status(400).send("Unable to save data to database");
    });
});

app.get("/getallidbook", (req, res) => {
  Book.find({}, (err, books) => {
    if (err) {
      res.send(err);
    } else {
      let idCollection = [];
      books.forEach((book) => {
        idCollection.push(book.id);
      });
      res.send(idCollection);
    }
  });
});

app.get("/getallbook", (req, res) => {
  Book.find({}, (err, books) => {
    if (err) {
      res.send(err);
    } else {
      res.send(books);
    }
  });
});

app.post("/getallbook", async (req, res) => {
  if ((Number(req.body.limit) > 0) & (Number(req.body.skip) >= 0)) {
    let count = await Book.count({}, (err, result) => {
      if (err) {
        res.send(err);
      } else {
        return result;
      }
    });
    Book.find({}, (err, books) => {
      if (err) {
        res.send(err);
      } else {
        res.send({ data: books, count: count });
      }
    })
      .limit(Number(req.body.limit))
      .skip(Number(req.body.skip));
  } else {
    res.send("Please provide  limit and skip");
  }
});

app.post("/getBook", async (req, res) => {
  let id = req.body.id;
  if (id) {
    Book.find({ id: id }, (err, book) => {
      if (err) {
        res.send(err);
      } else {
        res.send(book);
      }
    });
  }
});

app.post("/postreview", async (req, res) => {
  let data = req.body;
  let book = await Book.findOne(
    { id: data.id },
    { strict: false },
    (err, result) => {
      if (err) {
        return null;
      } else {
        return result;
      }
    }
  );

  let newData = {
    rate: data.reviews.rate,
    review: data.reviews.review,
    reviewer: { fullName: data.reviews.reviewer },
  };

  let newUpdate;
  if (book._doc.reviews) {
    newUpdate = [...book._doc.reviews, newData];
  } else {
    newUpdate = [newData];
  }

  Book.findOneAndUpdate(
    { id: data.id },
    { reviews: newUpdate },
    { strict: false },
    (err, book) => {
      if (err) {
        res.status(404).send(err);
      } else {
        res.send(book);
      }
    }
  );
});

app.post("/getallbook/:user", (req, res) => {
  res.send(req.params.user);
});

app.post("/collection/changePossesion", async (req, res) => {
  let possession = req.body.possession;
  let id = req.body.id;

  Book.findOneAndUpdate(
    { id },
    { possession },
    { strict: false },
    (err, book) => {
      if (err) {
        res.status(404).send(err);
      } else {
        res.send(book);
      }
    }
  );
});

app.post("/registerDomain", (req, res) => {
  let data = req.body;
  let domain = new ParaDomain(data);

  domain
    .save()
    .then((item) => {
      res.send(domain);
    })
    .catch((err) => {
      res.status(400).send("Unable to save data to database");
    });
});

app.get("/getAllUser", (req, res) => {
  ParaDomain.find({ domainId: "lstUser" }, (err, lstUser) => {
    if (err) {
      res.send(err);
    } else {
      res.send(lstUser[0]);
    }
  });
});

app.post("/getSingleUser/:user", async (req, res) => {
  let user = req.params.user;
  let allUser = await ParaDomain.find(
    { domainId: "lstUser" },
    (err, lstUser) => {
      if (err) {
        console.log(err);
      } else {
        return lstUser[0].data;
      }
    }
  );

  if (allUser && user) {
    allUser[0].data.forEach(async (singleUser) => {
      if (singleUser.fullName.toLowerCase().includes(user)) {
        if ((Number(req.body.limit) > 0) & (Number(req.body.skip) >= 0)) {
          let count = await Book.count(
            { possession: singleUser.fullName },
            (err, result) => {
              if (err) {
                res.send(err);
              } else {
                return result;
              }
            }
          );
          Book.find({ possession: singleUser.fullName }, (err, books) => {
            if (err) {
              res.send(err);
            } else {
              res.send({
                data: books,
                count,
              });
            }
          })
            .limit(Number(req.body.limit))
            .skip(Number(req.body.skip));
        }
      }
    });
  } else {
    res.send("error get book collection by user");
  }
});

app.get("/genre", (req, res) => {
  Genre.find({}, (err, genre) => {
    if (err) {
      res.send(err);
    } else {
      res.send(genre);
    }
  });
});

app.post("/genre", (req, res) => {
  let data = req.body;
  if (data) {
    let genre = new Genre(data);
    genre
      .save()
      .then((item) => {
        res.send(genre);
      })
      .catch((err) => {
        res.status(404).send(err);
      });
  }
});

// USERS
app.post("/register", (req, res) => {
  const user = req.body;

  const newUser = new User(user);

  newUser
    .save()
    .then((user) => res.send(newUser))
    .catch((err) => {
      res.status(400).send("Unable to save user");
    });
});

// EXPRESS LISTENER (PLACE IT ON THE LAST LINE OR VERY END)
app.listen(port, () => {
  console.log(`Server is up on port ${port}.`);
});
