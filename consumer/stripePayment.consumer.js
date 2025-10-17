import { connectRabbitMQ, publishMessage } from '../services/rabbitmq.services.js'
import { Rental, Products, RentalStatus, User } from '../models/associations.js'

const queue = 'rental_paid_queue'
const exchange = 'rentals_exchange'

const rentalConsumer = async () => {
  const { channel } = await connectRabbitMQ()

  await channel.assertExchange(exchange, 'direct', { durable: true })

  await channel.assertQueue(queue, { durable: true })
  await channel.bindQueue(queue, exchange, 'rental_paid')
  await channel.bindQueue(queue, exchange, 'rental_failed')

  channel.prefetch(5)

  channel.consume(queue, async (msg) => {
    if (!msg) return

    const eventType = msg.fields.routingKey
    const content = JSON.parse(msg.content.toString())
    console.log('Mensaje recibido en rental_paid_queue:', content)
    try {
      if (handlerRental[eventType]) {
        await handlerRental[eventType](content)
      } else {
        console.warn(`No hay handler para el evento: ${eventType}`)
      }

      channel.ack(msg)
    } catch (error) {
      console.error('Error procesando mensaje RabbitMQ:', error.message)
      channel.nack(msg, false, false)
    }
  })
}

const handlerRental = {
  rental_paid: async (data) => {
    const rental = await Rental.findByPk(data.rentalId, {
      include: [
        {
          model: Products,
          as: 'product',
          attributes: ['id', 'name']
        }, {
          model: User,
          as: 'renter',
          attributes: ['id', 'username', 'email']
        }
      ]
    })
    if (!rental) return console.warn(` Renta ${data.rentalId} no encontrada`)

    const enCursoStatus = await RentalStatus.findOne({ where: { status: 'en_curso' } })
    if (!enCursoStatus) return console.warn('Estado "en_curso" no encontrado')

    await rental.update({ status_id: enCursoStatus.id, payment_status: 'paid' })

    const product = await Products.findByPk(rental.product_id)
    if (product) {
      await product.update({ available: false })
    }

    console.log(`Renta ${data.rentalId} actualizada a "en_curso" y producto marcado como no disponible.`)

    await publishMessage('email_rental_paid', {
      email: rental.renter.email,
      username: rental.renter.username,
      productName: rental.product.name,
      rentalId: rental.id
    })
  },

  rental_failed: async (data) => {
    const rental = await Rental.findByPk(data.rentalId, {
      include: [
        {
          model: Products,
          as: 'product',
          attributes: ['id', 'name']
        }, {
          model: User,
          as: 'renter',
          attributes: ['id', 'username', 'email']
        }
      ]
    })
    if (!rental) return console.warn(` Renta ${data.rentalId} no encontrada`)

    const canceladaStatus = await RentalStatus.findOne({ where: { status: 'cancelada' } })
    if (!canceladaStatus) return console.error(' No existe estado "cancelada" en rental_status')

    await rental.update({ status_id: canceladaStatus.id, payment_status: 'failed' })

    const product = await Products.findByPk(rental.product_id)
    if (product) {
      await product.update({ available: true })
    }

    console.log(`Renta ${data.rentalId} actualizada a "cancelada" y producto marcado como disponible.`)

    await publishMessage('email_rental_failed', {
      email: rental.renter.email,
      username: rental.renter.username,
      productName: rental.product.name,
      rentalId: rental.id
    })
  }
}

rentalConsumer()
