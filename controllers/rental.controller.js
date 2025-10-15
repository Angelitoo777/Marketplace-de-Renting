import { Rental, RentalStatus, User, Products } from '../models/associations.js'
import { validationRental, validationRentalStatus } from '../validations/rental.validations.js'
import { redisClient } from '../databases/redis.database.js'

export class RentalController {
  static async getAll (req, res) {
    try {
      const cachedRentals = await redisClient.get('rentals:all')

      if (cachedRentals) {
        return res.status(200).json(JSON.parse(cachedRentals))
      }

      const findAll = await Rental.findAll({
        include: [
          { model: User, as: 'renter', attributes: ['id', 'username'] },
          { model: Products, as: 'product', attributes: ['id', 'name'] },
          { model: RentalStatus, as: 'status' }
        ],
        order: [['startDate', 'DESC']]
      })

      await redisClient.setex('rentals:all', 3600, JSON.stringify(findAll))

      return res.status(200).json(findAll)
    } catch (error) {
      console.error('error:', error.message)
      return res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  static async getById (req, res) {
    const { id } = req.params
    try {
      const cachedRental = await redisClient.get(`rental:${id}`)

      if (cachedRental) {
        return res.status(200).json(JSON.parse(cachedRental))
      }

      const findById = await Rental.findByPk(id, {
        include: [
          { model: User, as: 'renter', attributes: ['id', 'username'] },
          { model: Products, as: 'product', attributes: ['id', 'name'] },
          { model: RentalStatus, as: 'status' }
        ]
      })

      if (!findById) {
        return res.status(404).json({ message: 'Renta no encontrada' })
      }

      await redisClient.setex(`rental:${id}`, 3600, JSON.stringify(findById))

      return res.status(200).json(findById)
    } catch (error) {
      console.error('error:', error.message)
      return res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  static async getMyRentals (req, res) {
    const { id } = req.user

    try {
      const cachedRentals = await redisClient.get(`rentals:my:${id}`)

      if (cachedRentals) {
        return res.status(200).json(JSON.parse(cachedRentals))
      }

      const myRentals = await Rental.findAll({
        where: { renter_id: id },
        include: [
          { model: User, as: 'renter', attributes: ['id', 'username'] },
          { model: Products, as: 'product', attributes: ['id', 'name'] },
          { model: RentalStatus, as: 'status' }
        ]
      })

      await redisClient.setex(`rentals:my:${id}`, 3600, JSON.stringify(myRentals))

      return res.status(200).json(myRentals)
    } catch (error) {
      console.error('error:', error.message)
      return res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  static async createRental (req, res) {
    const { id } = req.user
    const validation = validationRental(req.body)

    if (!validation.success) {
      return res.status(422).json({ message: 'Error de validacion', errors: validation.error.issues })
    }

    const { product_id, startDate, endDate } = req.body

    try {
      const findProduct = await Products.findByPk(product_id)

      if (!findProduct) {
        return res.status(404).json({ message: 'Producto no encontrado' })
      }

      if (!findProduct.available) {
        return res.status(400).json({ message: 'Producto no disponible para renta' })
      }

      const dateStart = new Date(startDate)
      const dateEnd = new Date(endDate)
      const days = Math.ceil((dateEnd - dateStart) / (1000 * 60 * 60 * 24))

      if (days <= 0) {
        return res.status(400).json({ message: 'La fecha de fin debe ser mayor a la fecha de inicio' })
      }

      const totalPrice = parseFloat(findProduct.pricePerDay) * days

      const rentalStatus = await RentalStatus.findOne({ where: { status: 'Pending' } })

      if (!rentalStatus) {
        return res.status(500).json({ message: 'Estado de renta "Pendiente" no configurado' })
      }

      const newRental = await Rental.create({
        renter_id: id,
        product_id,
        startDate,
        endDate,
        totalPrice,
        status_id: rentalStatus.id
      })

      await findProduct.update({ available: false })

      await redisClient.del('rentals:all')
      await redisClient.del(`rental:${id}`)
      await redisClient.del(`rentals:my:${newRental.renter_id}`)

      return res.status(201).json({
        message: 'Renta creada exitosamente',
        rental: newRental
      })
    } catch (error) {
      console.error('error:', error.message)
      return res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  static async updateRentalStatus (req, res) {
    const { id } = req.params
    const validation = validationRentalStatus(req.body)

    if (!validation.success) {
      return res.status(422).json({ message: 'Error de validacion', errors: validation.error.issues })
    }
    const { status_id } = validation.data

    try {
      const rental = await Rental.findByPk(id)
      if (!rental) {
        return res.status(404).json({ message: 'Renta no encontrada' })
      }

      const status = await RentalStatus.findByPk(status_id)
      if (!status) {
        return res.status(404).json({ message: 'Estado de renta no encontrado' })
      }

      await rental.update({ status_id: status.id })

      await redisClient.del('rentals:all')
      await redisClient.del(`rental:${id}`)
      await redisClient.del(`rentals:my:${rental.renter_id}`)

      return res.status(200).json({ message: 'Estado de renta actualizado exitosamente' })
    } catch (error) {
      console.error('error:', error.message)
      return res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  static async deleteRental (req, res) {
    const { id } = req.params
    const renterId = req.user.id
    try {
      const rental = await Rental.findByPk(id)

      if (!rental) {
        return res.status(404).json({ message: 'Renta no encontrada' })
      }

      if (rental.status_id !== 1) {
        return res.status(400).json({ message: 'Solo se pueden eliminar rentas con estado Pendiente' })
      }

      if (renterId !== rental.renter_id) {
        return res.status(403).json({ message: 'No tienes permiso para eliminar esta renta' })
      }

      await Rental.destroy({ where: { id } })

      const product = await Products.findByPk(rental.product_id)

      if (product) {
        await product.update({ available: true })
      }

      await redisClient.del('rentals:all')
      await redisClient.del(`rental:${id}`)
      await redisClient.del(`rentals:my:${renterId}`)

      return res.status(200).json({ message: 'Renta eliminada exitosamente' })
    } catch (error) {
      console.error('error:', error.message)
      return res.status(500).json({ message: 'Error interno del servidor' })
    }
  }
}
