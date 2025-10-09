import { User, Roles } from './user.model.js'

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

export { User, Roles }
