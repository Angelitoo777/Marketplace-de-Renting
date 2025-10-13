import { AdminController } from '../controllers/admin.controller.js'
import { Router } from 'express'
import { isAdmin } from '../middlewares/roles.middleware.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

export const routesOfAdmin = Router()

routesOfAdmin.get('/users', authMiddleware, isAdmin, AdminController.getUser)
routesOfAdmin.get('/users/:id', authMiddleware, isAdmin, AdminController.getById)

routesOfAdmin.put('/users/:id', authMiddleware, isAdmin, AdminController.updateUser)
routesOfAdmin.patch('/users/:id/role', authMiddleware, isAdmin, AdminController.updateRol)
routesOfAdmin.delete('/users/:id', authMiddleware, isAdmin, AdminController.deleteUser)
