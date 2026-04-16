import dotenv from 'dotenv'
import path from 'path'
dotenv.config()

export default {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  dbPath: process.env.DB_PATH || './data/vault.db',
  sessionTimeout: parseInt(process.env.SESSION_TIMEOUT, 10) || 30, // 分钟
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
  }
}
