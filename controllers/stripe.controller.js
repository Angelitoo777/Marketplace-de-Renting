import { stripe } from '../services/stripe.services.js'
import { publishMessage } from '../services/rabbitmq.services.js'
import dotenv from 'dotenv'

dotenv.config()

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET

export class StripeController {
  static async paymentWebhook (req, res) {
    const sig = req.headers['stripe-signature']
    let event

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET)
    } catch (err) {
      console.error('Webhook error:', err.message)
      return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    const paymentIntent = event.data.object
    const rentalId = paymentIntent.metadata?.rental_id

    if (event.type === 'payment_intent.succeeded') {
      if (!rentalId) {
        console.log(' No se encontró rental_id en el metadata del PaymentIntent')
        return res.status(400).json({ message: 'Metadata de pago inválida' })
      }
      await publishMessage('rental_paid', {
        rentalId,
        payment_intent_id: paymentIntent.id
      })
    }

    if (event.type === 'payment_intent.payment_failed') {
      if (!rentalId) {
        console.log(' No se encontró rental_id en el metadata del PaymentIntent')
        return res.status(400).json({ message: 'Metadata de pago inválida' })
      }
      await publishMessage('rental_failed', {
        rentalId,
        payment_intent_id: paymentIntent.id
      })
    }

    return res.status(200).json({ received: true })
  }
}
