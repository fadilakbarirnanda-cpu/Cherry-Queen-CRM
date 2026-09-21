// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('💥 Error handler menangkap kesalahan:', err);

  const statusCode = err.status || err.statusCode || 500;
  const response = {
    success: false,
    message: err.message || 'Terjadi kesalahan internal pada server.',
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
