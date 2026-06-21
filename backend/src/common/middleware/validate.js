import { BadRequestError } from '../../core/errors.js';

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params
    });
    next();
  } catch (error) {
    const formattedErrors = error.errors.map((err) => ({
      field: err.path.join('.').replace(/^(body|query|params)\./, ''),
      message: err.message
    }));
    next(new BadRequestError('Validation failed', formattedErrors));
  }
};

export default validate;
