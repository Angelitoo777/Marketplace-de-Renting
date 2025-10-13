import { Products } from '../models/products.model.js'

export const isProductOwner = async (req, res, next) => {
  const productId = req.params.id
  const { id } = req.user
  const userRoles = req.user.role

  try {
    const product = await Products.findByPk(productId, {
      attributes: ['owner_id']
    })

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado.' })
    }

    const isNotOwner = product.owner_id !== id
    const isNotAdmin = !userRoles || !userRoles.includes('Admin')

    if (isNotOwner && isNotAdmin) {
      return res.status(403).json({ message: 'Acceso denegado. No autorizado para modificar este producto.' })
    }

    next()
  } catch (error) {
    console.error('Error en el middleware de propiedad:', error.message)
    return res.status(500).json({ message: 'Error interno del servidor al verificar la propiedad.' })
  }
}
