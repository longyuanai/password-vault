import config from '../config/index.js'

export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500
  let code = err.code || 'INTERNAL_ERROR'
  let message = err.message || '服务器内部错误'

  if (err.name === 'ValidationError') {
    statusCode = 400
    code = 'VALIDATION_ERROR'
  }

  // Log in development
  if (config.nodeEnv === 'development') {
    console.error('[Error]', err)
  }

  // Don't leak stack traces in production
  if (config.nodeEnv === 'production' && !err.isOperational) {
    message = '服务器内部错误'
    code = 'INTERNAL_ERROR'
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message
    }
  })
}
