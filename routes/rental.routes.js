import { Router } from 'express'
import { RentalController } from '../controllers/rental.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { isArrendador, isAdmin } from '../middlewares/roles.middleware.js'

export const routerOfRental = Router()

routerOfRental.get('/rentals', authMiddleware, isAdmin, RentalController.getAll)
routerOfRental.get('/rentals/:id', authMiddleware, isAdmin, RentalController.getById)
routerOfRental.get('/rentals/me', authMiddleware, RentalController.getMyRentals)

routerOfRental.post('/rentals', authMiddleware, RentalController.createRental)
routerOfRental.patch('/rentals/:id/status', authMiddleware, isArrendador, RentalController.updateRentalStatus)
routerOfRental.delete('/rentals/:id', authMiddleware, RentalController.deleteRental)
