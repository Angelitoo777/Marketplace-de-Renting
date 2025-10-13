import { User, Roles } from '../models/associations.js'
import { Op } from 'sequelize'
import { validatePartialUser, validateRol } from '../validations/user.validations.js'
import bcrypt from 'bcrypt'

export class AdminController {
  static async getUser (req, res) {
    try {
      const users = await User.findAll({
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

  static async getById (req, res) {
    const { id } = req.params
    try {
      const user = await User.findByPk(id, {
        include: [{
          model: Roles,
          as: 'roles',
          attributes: ['roles'],
          through: { attributes: [] }
        }]
      })

      return res.status(200).json(user)
    } catch (error) {
      console.error('error:', error.message)
      return res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  static async updateUser (req, res) {
    const { id } = req.params
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

      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10)
      } else {
        delete updateData.password
      }

      const [updatedUser] = await User.update(updateData, { where: { id } })

      if (updatedUser === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado o no se realizaron cambios.' })
      }

      const updatedUserInstance = await User.findByPk(id)

      return res.status(200).json({ message: 'Usuario actualizado correctamente', user: { username: updatedUserInstance.username, email: updatedUserInstance.email } })
    } catch (error) {
      console.error('error:', error.message)
      return res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  static async updateRol (req, res) {
    const { id } = req.params
    const validation = validateRol(req.body)

    if (!validation.success) {
      return res.status(422).json({ message: 'Error de validacion', errors: validation.error.issues })
    }

    const { roles } = validation.data

    try {
      const findUser = await User.findByPk(id)

      if (!findUser) {
        return res.status(404).json({ message: 'Usuario no encontrado' })
      }

      const role = await Roles.findByPk(roles)

      if (!role) {
        return res.status(404).json({ message: 'Rol no encontrado' })
      }

      await findUser.addRole(role)

      const updatedRole = await findUser.getRoles()

      return res.status(200).json({
        message: 'Rol actualizado correctamente',
        roles: updatedRole.map(rol => rol.roles)
      })
    } catch (error) {
      console.error('error:', error.message)
      return res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  static async deleteUser (req, res) {
    const { id } = req.params
    try {
      const userExisting = await User.findByPk(id)

      if (!userExisting) {
        return res.status(400).json({ message: 'Usuario no existente' })
      }

      await User.destroy({ where: { id } })

      return res.status(200).json({ message: 'Usuario eliminado exitosamente' })
    } catch (error) {
      console.error('error:', error.message)
      return res.status(500).json({ message: 'Error interno del servidor' })
    }
  }
}
