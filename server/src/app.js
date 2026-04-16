import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import config from './config/index.js'
import routes from './routes/index.js'
import { errorHandler } from './middlewares/errorHandler.js'

const app = express()

// Security headers
app.use(helmet())

// CORS - 允许微信小程序请求（小程序不发送 Origin header）
app.use(cors({
  origin: true,
  credentials: true
}))

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'))
}

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT',
      message: '请求过于频繁，请稍后再试'
    }
  }
})
app.use('/api', limiter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' }, message: '' })
})

// API routes
app.use('/api', routes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `路由 ${req.originalUrl} 不存在`
    }
  })
})

// Global error handler
app.use(errorHandler)

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port} [${config.nodeEnv}]`)
})

export default app
