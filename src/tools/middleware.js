const jwt = require("jsonwebtoken");
const User = require("../routes/user/schema");
const { verifyJWT } = require("./auth");

const authorize = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    // const token = req.cookies.Token;
    const decoded = await verifyJWT(token);

    console.log(`this is the decoded---->${JSON.stringify(decoded)}`);
    console.log(`this is the the userId---->${decoded._id}`);

    const user = await User.findOne({
      _id: decoded._id,
    })
      .populate("friendRequest", ["firstName", "pfImage"])
      .populate("posts")
      .populate("friends");

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    const err = new Error("Please authenticate");
    err.httpStatusCode = 401;
    next(err);
  }
};

module.exports = { authorize };
