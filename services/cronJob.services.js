import cron from 'node-cron'
import { Op } from 'sequelize'
import { Rental, RentalStatus, Products, User } from '../models/associations.js'
import { publishEvent } from '../services/rabbitmq.services.js'

export const startRentalCronJob = () => {
  cron.schedule('0 0 * * *', async () => {
    const today = new Date().toISOString().split('T')[0]

    try {
      const [enCurso, finalizada, cancelada] = await Promise.all([
        RentalStatus.findOne({ where: { status: 'en_curso' } }),
        RentalStatus.findOne({ where: { status: 'finalizada' } }),
        RentalStatus.findOne({ where: { status: 'cancelada' } })
      ])

      const paidRentals = await Rental.findAll({
        where: {
          startDate: today,
          payment_status: 'paid'
        },
        include: [{ model: Products, as: 'product' }, { model: User, as: 'renter' }]
      })

      for (const rental of paidRentals) {
        await rental.update({ status_id: enCurso.id })
        await rental.product.update({ available: false })

        await publishEvent('rental_started', {
          rentalId: rental.id,
          email: rental.renter.email,
          username: rental.renter.username,
          productName: rental.product.name,
          startDate: rental.startDate
        })
      }

      const endedRentals = await Rental.findAll({
        where: {
          endDate: { [Op.lt]: today },
          payment_status: 'paid'
        },
        include: [{ model: Products, as: 'product' }, { model: User, as: 'renter' }]
      })

      for (const rental of endedRentals) {
        await rental.update({ status_id: finalizada.id })
        await rental.product.update({ available: true })

        await publishEvent('rental_ended', {
          rentalId: rental.id,
          email: rental.renter.email,
          username: rental.renter.username,
          productName: rental.product.name,
          endDate: rental.endDate
        })
      }

      const expiredRentals = await Rental.findAll({
        where: {
          payment_status: 'pending',
          startDate: { [Op.lt]: today }
        },
        include: [{ model: Products, as: 'product' }, { model: User, as: 'renter' }]
      })

      for (const rental of expiredRentals) {
        await rental.update({ status_id: cancelada.id, payment_status: 'failed' })
        await rental.product.update({ available: true })

        await publishEvent('rental_canceled_auto', {
          rentalId: rental.id,
          email: rental.renter.email,
          username: rental.renter.username,
          productName: rental.product.name,
          startDate: rental.startDate
        })
      }

      console.log('✅ Cron job completado correctamente.')
    } catch (error) {
      console.error('Error en cron job de rentas:', error.message)
    }
  })
}
