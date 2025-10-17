import express from 'express'
import { sequelize } from './databases/mysql.database.js'
import { connectRabbitMQ } from './services/rabbitmq.services.js'
import dotenv from 'dotenv'
import { routesOfAuth } from './routes/auth.routes.js'
import { routesOfAdmin } from './routes/admin.routes.js'
import { routesOfProfile } from './routes/profile.routes.js'
import { routesOfProducts } from './routes/products.routes.js'
import { routerOfRental } from './routes/rental.routes.js'
import { routesOfStripe } from './routes/stripe.routes.js'
import { redisClient } from './databases/redis.database.js'
import swaggerUi from 'swagger-ui-express';
import swaggerFile from './swagger-output.json' assert { type: 'json' };
import cookieParser from 'cookie-parser'
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config()

const app = express()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT ?? 3000

app.use('/api', routesOfStripe)

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 

try {
  await sequelize.sync({ force: false })
  await connectRabbitMQ()
} catch (error) {
  console.error(error)
}

app.use('/auth', routesOfAuth)
app.use('/api', routesOfAdmin)
app.use('/api', routesOfProfile)
app.use('/api', routesOfProducts)
app.use('/api', routerOfRental)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.get('/', (req, res) => {
  res.send('Hello world')
})

app.get('/test-payment', (req, res) => {
  res.render('test-payment'); 
});

app.listen(PORT, () => {
  console.log('your server is running in port:', PORT)
})
