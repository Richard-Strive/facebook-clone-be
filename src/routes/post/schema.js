const { Schema, model } = require("mongoose");

// IF IMAGE EXIST MAKE IT REQUIRED IF NOT? MAKE TEXT REQUIRED

const PostSchema = new Schema({
  userRef: {
    type: String,
  },
  image: {
    type: String,
  },
  text: {
    type: String,
  },
  likes: {
    type: String,
  },
  comments: {
    type: String,
  },
});

module.exports = model("Post", PostSchema);
