import { Products, User } from '../models/associations.js'
import { validationProduct, validationPartialProduct } from '../validations/products.validations.js'
import { redisDB } from '../databases/redis.database.js'

const redisClient = await redisDB()

export class ProductsController {
  static async getAll (req, res) {
    try {
      const cacheKey = 'products:all'

      const cacheProducts = await redisClient.get(cacheKey)

      if (cacheProducts) {
        return res.status(200).json(JSON.parse(cacheProducts))
      }

      const getProducts = await Products.findAll({
        include: [{
          model: User,
          as: 'owner',
          attributes: ['id', 'username']
        }]
      })

      await redisClient.setex(cacheKey, 60, JSON.stringify(getProducts))

      return res.status(200).json(getProducts)
    } catch (error) {
      console.error('error:', error.message)
      return res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  static async getById (req, res) {
    const { id } = req.params
    try {
      const cacheKey = `products:${id}`

      const cacheProducts = await redisClient.get(cacheKey)

      if (cacheProducts) {
        return res.status(200).json(JSON.parse(cacheProducts))
      }

      const getProductById = await Products.findByPk(id, {
        include: [{
          model: User,
          as: 'owner',
          attributes: ['id', 'username']
        }]
      })

      await redisClient.setex(cacheKey, 60, JSON.stringify(getProductById))

      return res.status(200).json(getProductById)
    } catch (error) {
      console.error('error:', error.message)
      return res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  static async createProduct (req, res) {
    const validation = validationProduct(req.body)
    const { id } = req.user

    if (!validation.success) {
      return res.status(422).json({ message: 'Error de validacion', errors: validation.error.issues })
    }

    const productData = {
      ...validation.data, owner_id: id
    }

    try {
      const newProduct = await Products.create(productData)

      await redisClient.del('products:all')

      return res.status(201).json({ message: 'Producto creado exitosamente.', newProduct })
    } catch (error) {
      console.error('error:', error.message)
      return res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  static async updateProduct (req, res) {
    const { id } = req.params
    const validation = validationPartialProduct(req.body)

    if (!validation.success) {
      return res.status(422).json({ message: 'Error de validacion', errors: validation.error.issues })
    }

    const updateData = validation.data

    try {
      const [updatedProduct] = await Products.update(updateData, { where: { id } })

      if (updatedProduct === 0) {
        return res.status(404).json({ message: 'Producto no encontrado o no se realizaron cambios.' })
      }

      const updatedProductInstance = await Products.findByPk(id)

      await redisClient.del('products:all')

      return res.status(200).json({ message: 'Producto actualizado exitosamente.', updatedProductInstance })
    } catch (error) {
      console.error('error:', error.message)
      return res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  static async deleteProduct (req, res) {
    const { id } = req.params

    try {
      await Products.destroy({ where: { id } })

      await redisClient.del('products:all')

      return res.status(200).json({ message: 'Producto eliminado exitosamente.' })
    } catch (error) {
      console.error('error:', error.message)
      return res.status(500).json({ message: 'Error interno del servidor' })
    }
  }
}
