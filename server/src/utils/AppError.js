export class AppError extends Error {
  constructor(message, statusCode, code = 'INTERNAL_ERROR') {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

export function catchAsync(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
