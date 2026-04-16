import { Router } from 'express'
import { body, param, query } from 'express-validator'
import { authenticate } from '../middlewares/auth.js'
import { validate } from '../middlewares/validate.js'
import * as entryController from '../controllers/entryController.js'

const router = Router()

// 所有条目路由需要认证
router.use(authenticate)

// 健康检查放在 :id 之前，避免被匹配为 id
router.get('/health', entryController.healthCheck)

router.get('/',
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString(),
    query('category').optional().isString()
  ]),
  entryController.getAll
)

router.get('/:id',
  validate([param('id').isString().notEmpty()]),
  entryController.getById
)

router.post('/',
  validate([
    body('title').notEmpty().withMessage('标题不能为空'),
    body('password').notEmpty().withMessage('密码不能为空')
  ]),
  entryController.create
)

router.put('/:id',
  validate([param('id').isString().notEmpty()]),
  entryController.update
)

router.delete('/:id',
  validate([param('id').isString().notEmpty()]),
  entryController.remove
)

export default router
