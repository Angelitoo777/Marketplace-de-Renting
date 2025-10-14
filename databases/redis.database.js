import Redis from 'ioredis'
import dotenv from 'dotenv'
dotenv.config()

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

export const redisClient = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null
})

redisClient.on('connect', () => console.log('Redis conectado'))
redisClient.on('error', (err) => console.error('Redis Error:', err))
