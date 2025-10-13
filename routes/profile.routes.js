import { ProfileController } from '../controllers/profile.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { Router } from 'express'

export const routesOfProfile = Router()

routesOfProfile.get('/profile', authMiddleware, ProfileController.getMe)

routesOfProfile.put('/profile', authMiddleware, ProfileController.updateProfile)
routesOfProfile.patch('/profile/password', authMiddleware, ProfileController.updatePassword)
