const { sendError } = require('../utils/response');

/**
 * Middleware factory: Validate request body against a Zod schema
 * @param {ZodSchema} schema - The Zod schema to validate against
 */
const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // Zod v4 uses .issues (previously .errors)
      const errors = (result.error.issues || result.error.errors || []).map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return sendError(res, 'Validation failed', 400, errors);
    }

    req.body = result.data; // Use parsed/coerced data
    next();
  };
};

module.exports = { validate };
