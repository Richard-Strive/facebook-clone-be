const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");
// NEED TO SAVE USER HASHED PASSWORD

// NEED TO ADD REGEX FOR EMAIL VALIDIFICATION

// FOR LOGIN: IF PASSWORD EXIST? MAKE IT REQUIRED IF NOT? MAKE FACE ID REQUIRED

const UserSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
  },
  jobs: [String],
  birthDay: {
    type: String,
  },
  gender: {
    type: String,
  },
  bgImage: {
    type: String,
  },
  pfImage: {
    type: String,
  },
  friendRequest: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  friends: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  faceRec: {
    type: String,
  },
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  socketId: {
    type: String,
  },
  refreshTokens: [],
});

UserSchema.statics.findByCredentials = async function (lastName, plainPW) {
  const user = await this.findOne({ lastName });

  // console.log("this is the user found", user);

  if (user) {
    // const isMatch = await bcrypt.compare(plainPW, user.password);
    const isMatch = await (plainPW === user.password);
    if (isMatch) return user;
    else console.log("Password incorrect");
  } else {
    console.log("No user whit this credentials found");
  }
};

module.exports = model("User", UserSchema);
