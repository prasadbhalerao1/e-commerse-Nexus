import { ApiError } from '../errors.js';
import logger from '../../config/logger.js';
import env from '../../config/env.js';

const globalErrorHandler = (err, req, res, next) => {
  let error = err;

  // If the error is not an instance of our custom ApiError, wrap it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
    const message = error.message || 'Something went wrong';
    error = new ApiError(statusCode, message, err.errors || [], err.stack);
  }

  const response = {
    statusCode: error.statusCode,
    message: error.message,
    success: error.success,
    errors: error.errors,
    ...(env.NODE_ENV === 'development' ? { stack: error.stack } : {})
  };

  logger.error(`[Error] ${req.method} ${req.url} - ${error.message}`, { stack: error.stack });

  return res.status(error.statusCode).json(response);
};

export default globalErrorHandler;
