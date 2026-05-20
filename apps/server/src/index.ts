import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { env } from './env'

const app = express()

app.use(cors())
app.use(helmet())
app.use(express.json())

app.get('/health', (_, res) => {
  res.json({
    status: 'ok',
    service: 'spectre.io'
  })
})

app.listen(env.PORT, () => {
  console.log(`server running on ${env.PORT}`)
})
