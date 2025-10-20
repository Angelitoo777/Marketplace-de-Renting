import { connectRabbitMQ } from '../services/rabbitmq.services.js'
import { sendMailPayment, rentalStartedTemplate, rentalEndedTemplate, rentalCancelledTemplate } from '../services/emailSender.services.js'

const exchange = 'rentals_email_exchange'
const queue = 'email_rental_queue'

export const emailConsumer = async () => {
  const { channel } = await connectRabbitMQ()

  await channel.assertExchange(exchange, 'topic', { durable: true })
  await channel.assertQueue(queue, { durable: true })

  await channel.bindQueue(queue, exchange, 'rental_started')
  await channel.bindQueue(queue, exchange, 'rental_ended')
  await channel.bindQueue(queue, exchange, 'rental_cancelled_auto')

  channel.prefetch(5)

  console.log('Esperando mensajes de RabbitMQ (eventos de renta)...')

  channel.consume(queue, async (msg) => {
    if (!msg) return

    const eventType = msg.fields.routingKey
    const data = JSON.parse(msg.content.toString())

    try {
      let subject = ''
      let html = ''

      if (eventType === 'rental_started') {
        subject = 'Tu renta ha comenzado'
        html = rentalStartedTemplate(data.username, data.productName, data.startDate)
      }

      if (eventType === 'rental_ended') {
        subject = 'Tu renta ha finalizado'
        html = rentalEndedTemplate(data.username, data.productName, data.endDate)
      }

      if (eventType === 'rental_cancelled_auto') {
        subject = 'Renta cancelada automáticamente'
        html = rentalCancelledTemplate(data.username, data.productName, data.startDate)
      }

      if (subject && html) {
        await sendMailPayment(data.email, subject, html)
        console.log(`📧 Email enviado (${eventType}) a ${data.email}`)
      } else {
        console.warn(`Evento no manejado: ${eventType}`)
      }

      channel.ack(msg)
    } catch (error) {
      console.error('Error enviando correo:', error.message)
      channel.nack(msg, false, false)
    }
  })
}

await emailConsumer()
