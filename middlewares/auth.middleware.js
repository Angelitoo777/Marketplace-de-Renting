import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET no definido en .env')
  process.exit(1)
}

export const authMiddleware = (req, res, next) => {
  const token = req.cookies.access_token

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. No se proporciono token' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)

    req.user = decoded

    next()
  } catch (error) {
    return res.status(401).json({ message: 'Token no valido ' })
  }
}
