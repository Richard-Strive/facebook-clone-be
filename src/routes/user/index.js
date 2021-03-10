const express = require("express");
const mongoose = require("mongoose");
const { authenticate } = require("../../tools/auth");
const { authorize } = require("../../tools/middleware");

// TO DO IF USER DID NOT UPLOAD A PROFILE PIC OR A BACKGROUND IMAGE THE SERVE WOULD ADD A DEFAULT ONE

const User = require("./schema");
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

route.post("/post/:id", authorize, async (req, res, next) => {
  try {
  } catch (error) {
    console.log(error);
  }
});

module.exports = route;
