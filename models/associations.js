import { User, Roles } from './user.model.js'
import { Products } from './products.model.js'
import { Rental, RentalStatus } from './rental.model.js'

User.belongsToMany(Roles, {
  through: 'user_roles',
  foreignKey: 'user_id',
  otherKey: 'roles_id',
  as: 'roles'
})

Roles.belongsToMany(User, {
  through: 'user_roles',
  foreignKey: 'roles_id',
  otherKey: 'user_id',
  as: 'user'
})

User.hasMany(Products, {
  foreignKey: 'owner_id',
  as: 'products'
})

Products.belongsTo(User, {
  foreignKey: 'owner_id',
  as: 'owner'
})

User.hasMany(Rental, {
  foreignKey: 'renter_id',
  as: 'rentals'
})

Rental.belongsTo(User, {
  foreignKey: 'renter_id',
  as: 'renter'
})

Products.hasMany(Rental, {
  foreignKey: 'product_id',
  as: 'rentals'
})

Rental.belongsTo(Products, {
  foreignKey: 'product_id',
  as: 'product'
})

RentalStatus.hasMany(Rental, {
  foreignKey: 'status_id',
  as: 'rentals'
})

Rental.belongsTo(RentalStatus, {
  foreignKey: 'status_id',
  as: 'status'
})
export { User, Roles, Products, Rental, RentalStatus }
