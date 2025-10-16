import Stripe from 'stripe'
import dotenv from 'dotenv'

dotenv.config()

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY

export const stripe = new Stripe(STRIPE_SECRET_KEY)

export const createPaymentIntent = async (totalPrice, rental_id, product_id, renter_id) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100), // Convierte en centavos
      currency: 'usd',
      metadata: {
        rental_id: String(rental_id),
        product_id: String(product_id),
        renter_id: String(renter_id)
      }
    }, { idempotencyKey: `rental_${rental_id}` })
    return paymentIntent
  } catch (error) {
    console.error('Error creando el intento de pago:', error)
    throw error
  }
}
