import express from 'express'
import { sequelize } from './databases/mysql.database.js'
import dotenv from 'dotenv'
import { routesOfAuth } from './routes/auth.routes.js'
import { routesOfAdmin } from './routes/admin.routes.js'
import { routesOfProfile } from './routes/profile.routes.js'
import cookieParser from 'cookie-parser'

dotenv.config()

const app = express()
const PORT = process.env.PORT ?? 3000

app.use(express.json())
app.use(cookieParser())

try {
  await sequelize.sync({ force: false })
} catch (error) {
  console.error(error)
}

app.use('/auth', routesOfAuth)
app.use('/api', routesOfAdmin)
app.use('/api', routesOfProfile)

app.get('/', (req, res) => {
  res.send('Hello world')
})

app.listen(PORT, () => {
  console.log('your server is running in port:', PORT)
})
