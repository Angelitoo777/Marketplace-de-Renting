import { z } from 'zod'

const pricePerDaySchema = z.number({
  invalid_type_error: 'El precio debe ser un número válido.'
})

  .gt(0, {
    message: 'El precio por día debe ser un valor mayor que cero.'
  })

  .refine(val => {
    return (val * 100) % 1 === 0
  }, {
    message: 'El precio solo puede tener hasta dos decimales (centavos).'
  })

  .refine(val => {
    const valString = val.toFixed(2)

    const integerPart = valString.split('.')[0].replace(/^-/, '')

    return integerPart.length <= 8
  }, {
    message: 'El precio excede el valor máximo permitido (99,999,999.99).'
  })

const validateProduct = z.object({
  name: z.string().min(3).max(255),
  description: z.string().min(20).max(2000),
  pricePerDay: pricePerDaySchema,
  available: z.boolean().default(true)
})

export const validationProduct = (data) => {
  return validateProduct.safeParse(data)
}

export const validationPartialProduct = (data) => {
  return validateProduct.partial().safeParse(data)
}
