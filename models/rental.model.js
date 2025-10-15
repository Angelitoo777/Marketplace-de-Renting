import { DataTypes } from 'sequelize'
import { sequelize } from '../databases/mysql.database.js'

export const Rental = sequelize.define('rental', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true,
      isAfterStart (value) {
        if (this.startDate && value <= this.startDate) {
          throw new Error('La fecha de fin debe ser posterior a la fecha de inicio.')
        }
      }
    }
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  payment_status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'paid', 'failed', 'refunded']]
    }
  },
  payment_intent_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Referencia al ID de la transacción Stripe u otro proveedor'
  }
})

export const RentalStatus = sequelize.define('rental_status', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    defaultValue: 'Pending'
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  timestamps: false
})
