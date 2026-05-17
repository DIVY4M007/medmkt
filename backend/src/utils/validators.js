// Tiny Zod-based validation helper to keep controllers concise.
const { z } = require('zod');

function validate(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next({
        status: 400,
        message: 'Validation failed',
        details: result.error.flatten(),
      });
    }
    req.body = result.data;
    next();
  };
}

module.exports = { z, validate };
