import { DataTypes } from 'sequelize'
import { sequelize } from '../databases/mysql.database.js'

export const User = sequelize.define('user', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
})

export const Roles = sequelize.define('roles', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  roles: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    defaultValue: 'User'
  }
}, {
  timestamps: false
})
