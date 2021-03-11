const express = require("express");
const mongoose = require("mongoose");
const { authenticate } = require("../../tools/auth");
const { authorize } = require("../../tools/middleware");

// TO DO IF USER DID NOT UPLOAD A PROFILE PIC OR A BACKGROUND IMAGE THE SERVE WOULD ADD A DEFAULT ONE

const User = require("./schema");
const Comment = require("../comment/schema");
const Post = require("../post/schema");
const { findByIdAndUpdate } = require("./schema");

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

// FIND USER ON THE APP
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

// ADD POST ON SPECIFIC USER ARRAY
route.post("/post/:userId", authorize, async (req, res, next) => {
  try {
    const post = new Post(req.body);
    await post.save();
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $addToSet: { posts: post._id },
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
    next(error);
  }
});

// DELETE POST ON SPECIFIC USER ARRAY
route.post("/post/:userId", authorize, async (req, res, next) => {
  try {
    // 1 DELETE POST FROM POSTS COLLECTION

    // 2 DELETE POST FROM ARRAY

    res.status(201).send(user);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// ADD COMMENT ON SPECIFIC POST
route.post("/addcomment/:postId", authorize, async (req, res, next) => {
  try {
    const comment = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $addToSet: { comments: req.body },
      },
      {
        useFindAndModify: false,
        new: true,
      }
    );
    res.status(201).send(comment);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// ADD LIKES ON SPECIFIC POST
route.post("/addlikes/:postId", authorize, async (req, res, next) => {
  try {
    const like = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $addToSet: { likes: req.body },
      },
      {
        useFindAndModify: false,
        new: true,
      }
    );

    res.status(201).send(like);
  } catch (error) {
    console.log(error);
  }
});

module.exports = route;
