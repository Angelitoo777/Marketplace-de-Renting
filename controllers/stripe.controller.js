import { stripe } from '../services/stripe.services.js'
import { Rental } from '../models/associations.js'
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

    if (event.type === 'payment_intent.succeeded') {
      try {
        const paymentIntent = event.data.object
        const rentalId = paymentIntent.metadata.rental_id

        await Rental.update(
          { paymentStatus: 'paid' },
          { where: { id: rentalId } }
        )
      } catch (error) {
        console.error('Error actualizando renta:', error.message)
      }
    }

    if (event.type === 'payment_intent.payment_failed') {
      try {
        const rentalId = event.data.object.metadata.rental_id
        await Rental.update(
          { paymentStatus: 'failed' },
          { where: { id: rentalId } }
        )
      } catch (error) {
        console.error('Error actualizando renta:', error.message)
      }
    }

    return res.json({ received: true })
  }
}
