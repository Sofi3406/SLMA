const errorHandler = (err, req, res, next) => {
  console.error('🔥 ERROR HANDLER TRIGGERED:');
  console.error(`   Path: ${req.method} ${req.originalUrl}`);
  console.error(`   Error: ${err.message}`);
  console.error(`   Stack: ${err.stack}`);
  
  // Initialize error object
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server Error';
  let errors = {};
  
  // Mongoose bad ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
    errors[err.path] = `Invalid ${err.path} format`;
  }
  
  // Mongoose duplicate key (MongoDB duplicate key error)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyPattern)[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : 'unknown';
    message = `${field} already exists: ${value}`;
    errors[field] = `${field} already exists`;
  }
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    
    // Extract all validation errors
    Object.keys(err.errors).forEach(key => {
      if (err.errors[key].kind === 'required') {
        errors[key] = `${key} is required`;
      } else if (err.errors[key].kind === 'unique') {
        errors[key] = `${key} must be unique`;
      } else if (err.errors[key].kind === 'minlength') {
        errors[key] = `${key} must be at least ${err.errors[key].properties.minlength} characters`;
      } else if (err.errors[key].kind === 'maxlength') {
        errors[key] = `${key} must be at most ${err.errors[key].properties.maxlength} characters`;
      } else if (err.errors[key].kind === 'enum') {
        errors[key] = `${key} must be one of: ${err.errors[key].properties.enumValues.join(', ')}`;
      } else {
        errors[key] = err.errors[key].message;
      }
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    errors.token = 'Invalid authentication token';
  }
  
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    errors.token = 'Authentication token has expired';
  }
  
  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File too large';
    errors.file = 'File size exceeds limit';
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Unexpected file field';
    errors.file = 'Unexpected file field in request';
  }
  
  // Syntax error in JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON in request body';
    errors.body = 'Request body must be valid JSON';
  }
  
  // Database connection errors
  if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
    statusCode = 503;
    message = 'Database connection error';
    errors.database = 'Unable to connect to database';
  }
  
  // Type errors
  if (err.name === 'TypeError') {
    message = 'Type error occurred';
  }
  
  // ALWAYS return JSON, never HTML
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
  };
  
  // Add errors object if we have validation errors
  if (Object.keys(errors).length > 0) {
    response.errors = errors;
  }
  
  // Add stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.errorDetails = {
      name: err.name,
      code: err.code,
      type: err.constructor.name,
    };
  }
  
  console.error(`   Responding with: ${statusCode} ${message}`);
  
  res.status(statusCode).json(response);
};

export default errorHandler;