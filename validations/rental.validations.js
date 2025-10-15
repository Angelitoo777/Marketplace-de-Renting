import { z } from 'zod'

export const rentalValidation = z.object({
  product_id: z.string().uuid(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
})

export const rentalStatusValidation = z.object({
  status_id: z.number().int().positive()
})

export const validationRental = (data) => {
  return rentalValidation.safeParse(data)
}

export const validationRentalStatus = (data) => {
  return rentalStatusValidation.safeParse(data)
}
