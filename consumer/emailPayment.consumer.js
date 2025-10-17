import { connectRabbitMQ } from '../services/rabbitmq.services.js'
import { sendMailPayment, rentalSuccessTemplate, rentalFailedTemplate } from '../services/emailSender.services.js'

const exchange = 'rentals_exchange'
const queue = 'email_queue'

export const emailConsumer = async () => {
  const { channel } = await connectRabbitMQ()

  await channel.assertExchange(exchange, 'direct', { durable: true })
  await channel.assertQueue(queue, { durable: true })

  await channel.bindQueue(queue, exchange, 'email_rental_paid')
  await channel.bindQueue(queue, exchange, 'email_rental_failed')

  channel.prefetch(5)

  console.log('Esperando mensajes de RabbitMQ...')

  channel.consume(queue, async (msg) => {
    if (!msg) return
    const eventType = msg.fields.routingKey
    const data = JSON.parse(msg.content.toString())

    try {
      if (eventType === 'email_rental_paid') {
        const subject = 'Confirmación de tu Renta en Marketplace'
        const html = rentalSuccessTemplate(data.username, data.productName, data.rentalId)
        await sendMailPayment(data.email, subject, html)
      }

      if (eventType === 'email_rental_failed') {
        const subject = 'Error en el pago de tu Renta'
        const html = rentalFailedTemplate(data.username, data.productName, data.rentalId)
        await sendMailPayment(data.email, subject, html)
      }

      console.log(`Email enviado (${eventType}) a ${data.email}`)
      channel.ack(msg)
    } catch (error) {
      console.error('Error enviando correo:', error.message)
      channel.nack(msg, false, false)
    }
  })
}

await emailConsumer()
