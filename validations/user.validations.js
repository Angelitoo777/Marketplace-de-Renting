import { z } from 'zod'

const validationUser = z.object({
  username: z.string().min(3).max(12),
  email: z.string().email(),
  password: z.string().min(6),
  roles: z.array(
    z.number().int().positive().min(1).optional().default([1])
  )
})

export const validateUser = (data) => {
  return validationUser.safeParse(data)
}

export const validateLogin = (data) => {
  return validationUser.partial().safeParse(data)
}
