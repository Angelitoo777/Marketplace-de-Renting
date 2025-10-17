import amqp from 'amqplib'
import dotenv from 'dotenv'

dotenv.config()

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost'

let connection = null
let channel = null

export const connectRabbitMQ = async () => {
  // Si ya tenemos una conexión y un canal, los reutilizamos
  if (channel) {
    return { connection, channel }
  }

  try {
    connection = await amqp.connect(RABBITMQ_URL)
    channel = await connection.createChannel()

    console.log('Conectado a RabbitMQ')

    connection.on('close', () => {
      console.error('Conexión a RabbitMQ cerrada!')
      connection = null
      channel = null
    })

    return { connection, channel }
  } catch (error) {
    console.error('Error conectando a RabbitMQ:', error.message)
    throw error
  }
}

export const publishMessage = async (eventType, eventData) => {
  try {
    const { channel } = await connectRabbitMQ()

    const routingKey = eventType

    const exchange = 'rentals_exchange'
    await channel.assertExchange(exchange, 'direct', { durable: true })

    channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(eventData)), { persistent: true })

    console.log(`Mensaje publicado en RabbitMQ - Evento: ${eventType}`, eventData)
  } catch (error) {
    console.error('Error publicando mensaje en RabbitMQ:', error.message)
    throw new Error(error)
  }
}
