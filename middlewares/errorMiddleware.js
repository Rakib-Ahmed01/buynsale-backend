function notFoundMiddleware(req, res, next) {
  const error = new Error('404 Not Found!');
  error.status = 404;
  next(error);
}

function globalErrorMiddleware(err, req, res, next) {
  console.log(err);
  if (err && err.status) {
    return res.status(err.status).json({
      error: {
        status: err.status,
        message: err.message,
      },
    });
  } else {
    return res.status(500).json({
      error: {
        status: 500,
        message: err.message,
      },
    });
  }
}

module.exports = {
  notFoundMiddleware,
  globalErrorMiddleware,
};
