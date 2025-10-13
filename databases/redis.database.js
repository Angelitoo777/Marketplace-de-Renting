import { Redis } from 'ioredis'
import dotenv from 'dotenv'
dotenv.config()

const REDIS_HOST = process.env.REDIS_HOST
const REDIS_PORT = process.env.REDIS_PORT

export const redisDB = async () => {
  try {
    const redisClient = new Redis({
      host: REDIS_HOST || 'localhost',
      port: REDIS_PORT || 6379
    })
    console.log('Conexión a Redis establecida correctamente y lista para usarse.')

    return redisClient
  } catch (error) {
    console.error('Error de conexión a Redis:', error.message)
  }
}
