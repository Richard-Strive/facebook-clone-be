const express = require("express");
const mongoose = require("mongoose");
const { authenticate } = require("../../tools/auth");
const { authorize } = require("../../tools/middleware");

// TO DO IF USER DID NOT UPLOAD A PROFILE PIC OR A BACKGROUND IMAGE THE SERVE WOULD ADD A DEFAULT ONE

const User = require("./schema");
const Comment = require("../comment/schema");
const Post = require("../post/schema");

const route = express.Router();

route.post("/registration", async (req, res, next) => {
  try {
    const newUser = new User(req.body);

    await newUser.save();

    const { _id } = newUser;
    res.status(201).send(_id);
  } catch (error) {
    console.log(error);
  }
});

route.post("/login", async (req, res, next) => {
  try {
    const { lastName, password } = req.body;

    const userFound = await User.findByCredentials(lastName, password);
    if (userFound) {
      const tokens = await authenticate(userFound);
      res.status(200).send(tokens);
    } else {
      const err = new Error();
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    console.log(error);
  }
});

route.get("/me", authorize, async (req, res, next) => {
  try {
    res.status(200).send(req.user);
  } catch (error) {
    console.log(error);
  }
});

route.get("/finduser", authorize, async (req, res, next) => {
  try {
    const foundUser = await User.findOne({
      $or: [{ firstName: req.query.q }, { lastName: req.query.q }],
    });
    if (foundUser) {
      res.send(foundUser);
    } else {
      const err = new Error("No user found");
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    console.log(error);
  }
});

route.post("/post/:id", authorize, async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      req.params.id,
      {
        $addToSet: { posts: new Post(req.body) },
      },
      {
        useFindAndModify: false,
        new: true,
      }
    );

    console.log(user);
    res.status(201).send(user);
  } catch (error) {
    console.log(error);
  }
});

//1 grab user id
//2 grab post id
//3 grab like array and add one obj that contains {userRef} on FE
route.post("/like-post/:id", authorize, async (req, res, next) => {
  try {
    const post = { ...req.body, userRef: "Richard" };
    const newPost = new Post(post);
    // await newPost.save();

    const user = await User.findOneAndUpdate(
      req.params.id,
      {
        $addToSet: { posts: newPost },
      },
      {
        useFindAndModify: false,
        new: true,
      }
    );

    console.log(user);
    res.status(201).send(user);
  } catch (error) {
    console.log(error);
  }
});
route.post("/post/:id", authorize, async (req, res, next) => {
  try {
    const post = { ...req.body, userRef: "Richard" };
    const newPost = new Post(post);
    // await newPost.save();

    const user = await User.findOneAndUpdate(
      req.params.id,
      {
        $addToSet: { posts: newPost },
      },
      {
        useFindAndModify: false,
        new: true,
      }
    );

    console.log(user);
    res.status(201).send(user);
  } catch (error) {
    console.log(error);
  }
});

module.exports = route;
