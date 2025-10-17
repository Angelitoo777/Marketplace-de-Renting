import cron from 'node-cron'
import { Op } from 'sequelize'
import { Rental, RentalStatus, Products } from '../models/associations.js'

export const startRentalCronJob = () => {
  cron.schedule('0 0 * * *', async () => {
    const today = new Date().toISOString().split('T')[0]

    try {
      const enCursoStatus = await RentalStatus.findOne({ where: { status: 'en_curso' } })
      const paidRentals = await Rental.findAll({
        where: {
          startDate: today,
          payment_status: 'paid'
        },
        include: [{ model: Products, as: 'product' }]
      })

      for (const rental of paidRentals) {
        await rental.update({ status_id: enCursoStatus.id })
        await rental.product.update({ available: false })
        console.log(`Renta ${rental.id} iniciada y producto ${rental.product.id} marcado como no disponible.`)
      }

      const finalizedStatus = await RentalStatus.findOne({ where: { status: 'finalizada' } })
      const endedRentals = await Rental.findAll({
        where: {
          endDate: { [Op.lt]: today },
          payment_status: 'paid'
        },
        include: [{ model: Products, as: 'product' }]
      })

      for (const rentaol of endedRentals) {
        await rentaol.update({ status_id: finalizedStatus.id })
        await rentaol.product.update({ available: true })
        console.log(`Renta ${rentaol.id} finalizada y producto ${rentaol.product.id} marcado como disponible.`)
      }

      const canceladaStatus = await RentalStatus.findOne({ where: { status: 'cancelada' } })
      const expiredRentals = await Rental.findAll({
        where: {
          payment_status: 'pending',
          startDate: { [Op.lt]: today }
        },
        include: ['product']
      })

      for (const rental of expiredRentals) {
        await rental.update({ status_id: canceladaStatus.id, payment_status: 'failed' })
        await rental.product.update({ available: true })
        console.log(`Renta ${rental.id} cancelada por falta de pago y producto ${rental.product.id} marcado como disponible.`)
      }

      console.log('✅ Cron job completado correctamente.')
    } catch (error) {
      console.error('Error en cron job de rentas:', error.message)
    }
  })
}
