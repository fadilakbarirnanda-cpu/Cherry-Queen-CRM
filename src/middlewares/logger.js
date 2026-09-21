function requestLogger(req, res, next) {
  const start = Date.now();
  const { method, originalUrl } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const statusEmoji = statusCode >= 400 ? '⚠️' : '✅';
    console.log(`${statusEmoji} [${new Date().toISOString()}] ${method} ${originalUrl} - ${statusCode} (${duration}ms)`);
  });

  next();
}

module.exports = requestLogger;
