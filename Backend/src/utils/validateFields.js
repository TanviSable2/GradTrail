const validateRequired = (body, fields) => {
  for (const field of fields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      return field + ' is required';
    }
  }
  return null;
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

module.exports = { validateRequired, isValidEmail };