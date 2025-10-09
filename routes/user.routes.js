import { UserController } from '../controllers/user.controller.js'
import { Router } from 'express'
import { isAdmin } from '../middlewares/roles.middleware.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

export const routesOfUser = Router()

routesOfUser.get('/users', authMiddleware, isAdmin, UserController.getUser)
routesOfUser.get('/users/:id', authMiddleware, isAdmin, UserController.getUser)

routesOfUser.post('/register', UserController.registerUser)
routesOfUser.post('/login', UserController.loginUser)
