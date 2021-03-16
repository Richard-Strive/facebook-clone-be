const { Schema, model } = require("mongoose");

const MessageSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      required: true,
    },
    receiver: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model("Message", MessageSchema);
