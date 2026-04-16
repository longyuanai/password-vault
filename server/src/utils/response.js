export function successResponse(res, data = null, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    message
  })
}

export function errorResponse(res, statusCode, code, message) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message
    }
  })
}
