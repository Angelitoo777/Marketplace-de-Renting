import { User, Roles } from '../models/associations.js'
import { Op } from 'sequelize'
import { validateUser, validateLogin } from '../validations/user.validations.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET

export class UserController {
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

  static async registerUser (req, res) {
    const validation = validateUser(req.body)

    if (!validation.success) {
      return res.status(422).json({ message: 'Error de validacion', errors: validation.error.issues })
    }

    const { username, email, password, roles } = validation.data
    try {
      const userExisting = await User.findOne({ where: { [Op.or]: [{ username }, { email }] } })

      if (userExisting) {
        return res.status(400).json({ message: 'Usuario o correo electronico ya registrado' })
      }

      const hashPassword = await bcrypt.hash(password, 10)

      const newUser = await User.create({ username, email, password: hashPassword })

      const foundRoles = await Roles.findOne({ where: { id: roles } })
      await newUser.addRoles(foundRoles)

      return res.status(201).json({ message: 'Usuario creado exitosamente', username: newUser.username, email: newUser.email })
    } catch (error) {
      console.error('error:', error.message)
      return res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  static async loginUser (req, res) {
    const validation = validateLogin(req.body)

    if (!validation.success) {
      return res.status(422).json({ message: 'Error de validacion', errors: validation.error.issues })
    }

    const { username, password } = validation.data

    try {
      const user = await User.findOne({
        where: { username },
        include: [{
          model: Roles,
          as: 'roles',
          attributes: ['roles'],
          through: { attributes: [] }
        }]
      })

      if (!user) {
        return res.status(404).json({ message: 'Credenciales incorrectas' })
      }

      const passwordMatch = await bcrypt.compare(password, user.password)

      if (!passwordMatch) {
        return res.status(404).json({ message: 'Credenciales incorrectas' })
      }

      const userRoles = user.roles.map(role => role.roles)

      const token = jwt.sign({
        id: user.id,
        username: user.username,
        email: user.email,
        role: userRoles
      }, JWT_SECRET, { expiresIn: '1h' })

      return res
        .cookie('access_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 3600000 // 1 hr
        })
        .status(200)
        .json({ message: 'Te has logueado exitosamente' })
    } catch (error) {
      console.error('error:', error.message)
      return res.status(500).json({ message: 'Error interno del servidor' })
    }
  }
}
