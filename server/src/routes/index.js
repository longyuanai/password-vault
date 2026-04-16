import { Router } from 'express'
import authRoutes from './auth.js'
import entriesRoutes from './entries.js'
import toolsRoutes from './tools.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/entries', entriesRoutes)
router.use('/tools', toolsRoutes)

export default router
