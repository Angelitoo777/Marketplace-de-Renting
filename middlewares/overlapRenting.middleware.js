import { Rental, RentalStatus } from '../models/associations.js'
import { Op } from 'sequelize'

export const checkOverlapRenting = async (product_id, startDate, endDate) => {
  const overlappingRental = await Rental.findOne({
    where: {
      product_id,
      [Op.or]: [
        {
          startDate: { [Op.between]: [startDate, endDate] }
        },
        {
          endDate: { [Op.between]: [startDate, endDate] }
        },
        {
          startDate: { [Op.lte]: startDate },
          endDate: { [Op.gte]: endDate }
        }
      ]
    },
    include: {
      model: RentalStatus,
      as: 'status',
      where: { status: 'pending' }
    }
  })

  return Boolean(overlappingRental)
}
