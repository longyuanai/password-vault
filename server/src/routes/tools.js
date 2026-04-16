import { Router } from 'express'
import { body } from 'express-validator'
import { authenticate } from '../middlewares/auth.js'
import { validate } from '../middlewares/validate.js'
import * as toolsController from '../controllers/toolsController.js'

const router = Router()

// 所有工具路由需要认证
router.use(authenticate)

router.post('/generate-password',
  validate([
    body('length').optional().isInt({ min: 4, max: 128 }),
    body('uppercase').optional().isBoolean(),
    body('lowercase').optional().isBoolean(),
    body('numbers').optional().isBoolean(),
    body('symbols').optional().isBoolean(),
    body('excludeChars').optional().isString()
  ]),
  toolsController.generatePassword
)

router.get('/export', toolsController.exportEntries)

router.post('/import',
  validate([
    body('entries').exists().withMessage('缺少导入数据')
  ]),
  toolsController.importEntries
)

export default router
