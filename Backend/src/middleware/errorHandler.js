const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  if (err.code === '23505') {
    return res.status(409).json({ error: 'Duplicate entry - record already exists.' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
};

module.exports = errorHandler;