import { Router } from 'express'
import { body } from 'express-validator'
import { validate } from '../middlewares/validate.js'
import { authenticate } from '../middlewares/auth.js'
import * as authController from '../controllers/authController.js'

const router = Router()

// 无需认证
router.get('/status', authController.status)

router.post(
  '/setup',
  validate([
    body('masterPassword').isLength({ min: 8 }).withMessage('主密码至少 8 个字符')
  ]),
  authController.setup
)

router.post(
  '/unlock',
  validate([
    body('masterPassword').notEmpty().withMessage('主密码不能为空')
  ]),
  authController.unlock
)

// 需要认证
router.post('/lock', authenticate, authController.lock)

router.post(
  '/change-password',
  authenticate,
  validate([
    body('oldPassword').notEmpty().withMessage('旧密码不能为空'),
    body('newPassword').isLength({ min: 8 }).withMessage('新密码至少 8 个字符')
  ]),
  authController.changePassword
)

export default router
