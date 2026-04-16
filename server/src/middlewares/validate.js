import { validationResult } from 'express-validator'

export function validate(validations) {
  return async (req, res, next) => {
    await Promise.all(validations.map(v => v.run(req)))

    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return next()
    }

    const messages = errors.array().map(e => e.msg)

    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: messages.join('; ')
      }
    })
  }
}
