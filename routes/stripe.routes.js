import { StripeController } from '../controllers/stripe.controller.js'
import express, { Router } from 'express'

export const routesOfStripe = Router()

routesOfStripe.post('/stripe/webhook', express.raw({ type: 'application/json' }), StripeController.paymentWebhook)
