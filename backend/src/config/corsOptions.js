const corsOptions = {
  origin: function (origin, callback) {
    // Allow all origins in development
    return callback(null, true);
  },
  credentials: true,
};

module.exports = corsOptions;