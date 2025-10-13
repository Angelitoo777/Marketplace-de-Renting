import { AuthController } from '../controllers/auth.controller.js'
import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware.js'

export const routesOfAuth = Router()

routesOfAuth.get('/me', authMiddleware, AuthController.getMe)
routesOfAuth.get('/logout', authMiddleware, AuthController.logout)

routesOfAuth.post('/register', AuthController.registerUser)
routesOfAuth.post('/login', AuthController.loginUser)
