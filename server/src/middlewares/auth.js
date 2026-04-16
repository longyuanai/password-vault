import { AppError } from '../utils/AppError.js'
import { AuthService } from '../services/authService.js'

export function authenticate(req, res, next) {
  const sessionToken = req.headers['x-session-token']
  if (!sessionToken) {
    return next(new AppError('未提供会话令牌', 401, 'UNAUTHORIZED'))
  }

  if (!AuthService.validateSession(sessionToken)) {
    return next(new AppError('会话无效或已过期', 401, 'SESSION_INVALID'))
  }

  next()
}
