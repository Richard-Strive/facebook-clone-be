const { Schema, model } = require("mongoose");

const CommentSchema = new Schema({
  userRef: {
    type: String,
  },
  text: {
    type: String,
    required: true,
  },
});

module.exports = model("Comment", CommentSchema);
