const { Schema, model } = require("mongoose");

const MessageSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
});

module.exports = model("Message", MessageSchema);
