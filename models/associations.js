import { User, Roles } from './user.model.js'
import { Products } from './products.model.js'

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

export { User, Roles, Products }
