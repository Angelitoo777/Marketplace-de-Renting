import express from 'express'
import { sequelize } from './databases/mysql.database.js'
import dotenv from 'dotenv'
import { routesOfUser } from './routes/user.routes.js'
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

app.use('/auth', routesOfUser)

app.get('/', (req, res) => {
  res.send('Hello world')
})

app.listen(PORT, () => {
  console.log('your server is running in port:', PORT)
})
