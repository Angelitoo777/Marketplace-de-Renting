import { User, Roles } from '../models/associations.js'
import { Op } from 'sequelize'
import { validatePartialUser } from '../validations/user.validations.js'
import bcrypt from 'bcrypt'

export class ProfileController {
  static async getMe (req, res) {
    const { id } = req.user
    try {
      const users = await User.findByPk(id, {
        attributes: { exclude: ['password'] },
        include: [{
          model: Roles,
          as: 'roles',
          attributes: ['roles'],
          through: { attributes: [] }
        }]
      })

      return res.status(200).json(users)
    } catch (error) {
      console.error('error:', error.message)
      return res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  static async updateProfile (req, res) {
    const { id } = req.user
    const validation = validatePartialUser(req.body)

    if (!validation.success) {
      return res.status(422).json({ message: 'Error de validacion', errors: validation.error.issues })
    }

    const updateData = validation.data
    try {
      if (updateData.email || updateData.username) {
        const conflictUser = await User.findOne({
          where: { [Op.or]: [{ username: updateData.username }, { email: updateData.email }], id: { [Op.ne]: id } }
        })

        if (conflictUser) {
          return res.status(409).json({
            message: 'El nombre de usuario o correo electrónico ya está en uso por otra cuenta.'
          })
        }
      }

      const [updatedMyUser] = await User.update(updateData, { where: { id } })

      if (updatedMyUser === 0) {
        return res.status(404).json({ message: 'No se pudieron realizar los cambios.' })
      }

      const updatedUserInstance = await User.findByPk(id, { attributes: { exclude: ['password'] } })

      return res.status(200).json({ message: 'Usuario actualizado correctamente', user: { username: updatedUserInstance.username, email: updatedUserInstance.email } })
    } catch (error) {
      console.error('error:', error.message)
      return res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  static async updatePassword (req, res) {
    const { id } = req.user
    const validation = validatePartialUser(req.body)

    if (!validation.success) {
      return res.status(422).json({ message: 'Error de validacion', errors: validation.error.issues })
    }

    const { password } = validation.data

    try {
      const findPassword = await User.findByPk(id)
      const matchPassword = await bcrypt.compare(password, findPassword.password)

      if (matchPassword) {
        return res.status(400).json({ message: 'La nueva contraseña no puede ser la misma que la actual.' })
      }

      const newPassword = await bcrypt.hash(password, 10)

      const updatedPassword = await User.update({ password: newPassword }, { where: { id } })

      if (updatedPassword === 0) {
        return res.status(404).json({ message: 'No se pudieron realizar los cambios.' })
      }

      return res.status(200).json({ message: 'Contraseña actualizada correctamente' })
    } catch (error) {
      console.error('error:', error.message)
      return res.status(500).json({ message: 'Error interno del servidor' })
    }
  }
}
