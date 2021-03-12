const express = require("express");
const mongoose = require("mongoose");
const { authenticate, refreshToken } = require("../../tools/auth");
const { authorize } = require("../../tools/middleware");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const uniqid = require("uniqid");

const { CloudinaryStorage } = require("multer-storage-cloudinary");

// LOOK ON THE DOCUMENTATION FOR GIVING DYNAMIC FILENAME
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "facebook",
    format: async (req, file) => "png" || "jpg", // supports promises as well
    public_id: (req, file) => file.originalname,
  },
});

const parser = multer({ storage: storage });

const User = require("./schema");
const Comment = require("../comment/schema");
const Post = require("../post/schema");
const { findByIdAndUpdate } = require("./schema");

const route = express.Router();

route.post(
  "/upload/image",
  authorize,
  parser.single("image"),
  function (req, res) {
    console.log(req.file);
    res.send(req.file.path);
  }
);
// REGISTRATION
route.post("/registration", async (req, res, next) => {
  try {
    const theNewUser = {
      ...req.body,
      pfImage:
        "https://crestedcranesolutions.com/wp-content/uploads/2013/07/facebook-profile-picture-no-pic-avatar.jpg",
      bgImage: "https://cdn.hipwallpaper.com/i/47/15/E8PQD3.jpg",
    };

    const newUser = new User(theNewUser);

    await newUser.save();

    const { _id } = newUser;
    res.status(201).send(_id);
  } catch (error) {
    console.log(error);
  }
});

// LOGIN
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

// PERSONAL PROFILE INFOS
route.get("/me", authorize, async (req, res, next) => {
  try {
    res.status(200).send(req.user);
  } catch (error) {
    console.log(error);
  }
});

// SET PROFILE IMAGE
route.put(
  "/me/add-profile-image",
  parser.single("image"),
  authorize,
  async (req, res, next) => {
    try {
      const modifiedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
          pfImage: req.file.path,
        },
        {
          useFindAndModify: false,
          new: true,
        }
      );

      modifiedUser.save();
      res.status(200).send(modifiedUser);
    } catch (error) {
      console.log(error);
    }
  }
);

// SET BACKGROUND IMAGE
route.put(
  "/me/add-background-image",
  parser.single("image"),
  authorize,
  async (req, res, next) => {
    try {
      const modifiedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
          bgImage: req.file.path,
        },
        {
          useFindAndModify: false,
          new: true,
        }
      );

      modifiedUser.save();
      res.status(200).send(modifiedUser);
    } catch (error) {
      console.log(error);
    }
  }
);

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
route.delete("/post/:userId/:postId", authorize, async (req, res, next) => {
  try {
    // 1 DELETE POST FROM POSTS COLLECTION
    const post = await Post.findByIdAndDelete(req.params.postId);

    // 2 DELETE POST FROM ARRAY
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $pull: {
          posts: mongoose.Types.ObjectId(req.params.postId),
        },
      },
      {
        useFindAndModify: false,
        new: true,
      }
    );

    res.status(201).send("deleted");
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

//REFRASH TOKEN ROUTE
route.post("/refreshToken", async (req, res, next) => {
  // const oldRefreshToken = req.body.refreshToken;

  console.log(req.cookies);
  // if (!oldRefreshToken) {
  //   const err = new Error("Refresh token missing");
  //   err.httpStatusCode = 400;
  //   next(err);
  // } else {
  try {
    // const newTokens = await refreshToken(oldRefreshToken);
    // res.send(newTokens);
  } catch (error) {
    console.log(error);
    const err = new Error(error);
    err.httpStatusCode = 403;
    next(err);
  }
  // }
});

module.exports = route;
