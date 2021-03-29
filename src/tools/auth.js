const jwt = require("jsonwebtoken");
const User = require("../routes/user/schema");

const generateJWT = (payload) =>
  new Promise((res, rej) =>
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1 week" },
      (err, token) => {
        if (err) rej(err);
        res(token);
      }
    )
  );

const verifyJWT = (token) =>
  new Promise((res, rej) =>
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) rej(err);
      res(decoded);
    })
  );

const generateRefreshJWT = (payload) =>
  new Promise((res, rej) =>
    jwt.sign(
      payload,
      process.env.REFRESH_JWT_SECRET,
      { expiresIn: "1 week" },
      (err, token) => {
        if (err) rej(err);
        res(token);
      }
    )
  );

const verifyRefreshToken = (token) =>
  new Promise((res, rej) =>
    jwt.verify(token, process.env.REFRESH_JWT_SECRET, (err, decoded) => {
      if (err) rej(err);
      res(decoded);
    })
  );

//We are attaching to the user object both accessToken and refreshToken
const authenticate = async (user) => {
  try {
    const newAccessToken = await generateJWT({ _id: user._id });
    const newRefreshToken = await generateRefreshJWT({ _id: user._id });

    user.refreshTokens = user.refreshTokens.concat({ token: newRefreshToken });
    await user.save();

    return { token: newAccessToken, refreshToken: newRefreshToken };
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const refreshTokenG = async (oldRefreshToken) => {
  /**
   * 1 Verify the validity of inser refresh token and decoded it
   *  remeber the decoded it's simply an object that contains the user id (line 87):
   *"{ _id: '6048bcf0e734512e4727fa4a', iat: 1615503722, exp: 1616108522 }"
   */
  const decoded = await verifyRefreshToken(oldRefreshToken);

  //  2 Find in the db the user that has the specific id
  const user = await User.findOne({ _id: decoded._id });
  if (!user) {
    throw new Error(`Access is forbidden`);
  }

  // 3 Find if in the user refreshToken array there is a token that's equal to the oldRefreshToken
  const currentRefreshToken = user.refreshTokens.find(
    (t) => t.token === oldRefreshToken
  );

  if (!currentRefreshToken) {
    throw new Error(`Refresh token is wrong`);
  }

  const newAccessToken = await generateJWT({ _id: user._id });
  const newRefreshToken = await generateRefreshJWT({ _id: user._id });

  /*
  4 Replace the oldRefreshToken with the new one
    - create a new array without the old token
    - copy the new array values in the user refresh tokens array
   */
  const newRefreshTokens = user.refreshTokens
    .filter((t) => t.token !== oldRefreshToken)
    .concat({ token: newRefreshToken });

  user.refreshTokens = [...newRefreshTokens];

  await user.save();

  return { token: newAccessToken, refreshToken: newRefreshToken };
};

module.exports = { authenticate, verifyJWT, refreshTokenG };
