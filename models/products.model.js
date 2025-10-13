import { DataTypes } from 'sequelize'
import { sequelize } from '../databases/mysql.database.js'
import { User } from './user.model.js'

export const Products = sequelize.define('products', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  pricePerDay: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  available: {
    type:
    DataTypes.BOOLEAN,
    defaultValue: true
  },
  owner_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
})
