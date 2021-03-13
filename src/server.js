const express = require("express");
const cors = require("cors");

const listEndpoints = require("express-list-endpoints");
const mongoose = require("mongoose");

const cookieParser = require("cookie-parser");

const usersRouter = require("./routes/user/index");

const {
  notFoundHandler,
  forbiddenHandler,
  badRequestHandler,
  unAuthorizedHandler,
  catchAllErrorHandler,
} = require("./tools/errorHandlers");

const server = express();

const whitelist = ["http://localhost:3000"];

const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

server.use(cors(corsOptions));
const port = process.env.PORT;

server.use(express.json());
server.use(cookieParser());

server.use("/user", usersRouter);

// ERROR HANDLERS MIDDLEWARES

server.use(badRequestHandler);
server.use(forbiddenHandler);
server.use(notFoundHandler);
server.use(unAuthorizedHandler);
server.use(catchAllErrorHandler);

console.log(listEndpoints(server));
console.log(listEndpoints(server).length);

mongoose
  .connect(process.env.MONGO_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(
    server.listen(port, () => {
      console.log("Running on port", port);
    })
  )
  .catch((err) => console.log(err));
