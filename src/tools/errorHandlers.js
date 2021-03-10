const badRequestHandler = (err, req, res, next) => {
  if (err.httpStatusCode === 400) {
    res.status(400).send(err.message || "Your are making a bad request.");
  } else {
    next(err);
  }
};

const unAuthorizedHandler = (err, req, res, next) => {
  if (err.httpStatusCode === 401) {
    res.status(401).send(err.message || "UNAUTHORIZED!!!");
  } else {
    next(err);
  }
};

const forbiddenHandler = (err, req, res, next) => {
  if (err.httpStatusCode === 403) {
    res.status(403).send(err.message || "Forbidden attempt");
  } else {
    next(err);
  }
};

const notFoundHandler = (err, req, res, next) => {
  if (err.httpStatusCode === 404) {
    res.status(404).send(err.message || "Resource not found!");
  } else {
    next(err);
  }
};
const catchAllErrorHandler = (err, req, res, next) => {
  if (err.httpStatusCode === 500) {
    res
      .status(500)
      .send(err.message || "Generic error occured from the server side");
  } else {
    next(err);
  }
};

module.exports = {
  badRequestHandler,
  unAuthorizedHandler,
  forbiddenHandler,
  notFoundHandler,
  catchAllErrorHandler,
};
