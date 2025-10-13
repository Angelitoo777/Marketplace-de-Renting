import { Router } from 'express'
import { ProductsController } from '../controllers/products.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { isProductOwner } from '../middlewares/isOwner.middleware.js'
import { isArrendador } from '../middlewares/roles.middleware.js'

export const routesOfProducts = Router()

routesOfProducts.get('/products', authMiddleware, ProductsController.getAll)
routesOfProducts.get('/products/:id', authMiddleware, ProductsController.getById)

routesOfProducts.post('/products', authMiddleware, isArrendador, ProductsController.createProduct)
routesOfProducts.patch('/products/:id', authMiddleware, isArrendador, isProductOwner, ProductsController.updateProduct)
routesOfProducts.delete('/products/:id', authMiddleware, isArrendador, isProductOwner, ProductsController.deleteProduct)
