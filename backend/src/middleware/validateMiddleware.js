function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const dataToValidate = source === 'query' ? req.query : req.body;
      const parsed = schema.parse(dataToValidate);
      if (source === 'query') {
        req.query = parsed;
      } else {
        req.body = parsed;
      }
      next();
    } catch (err) {
      if (err.errors) {
        const details = err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }));
        return res.status(400).json({
          error: details[0]?.message || 'Validation error',
          details
        });
      }
      return res.status(400).json({ error: 'Invalid request data' });
    }
  };
}

module.exports = validate;
