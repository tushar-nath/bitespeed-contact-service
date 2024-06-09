import 'reflect-metadata'
import { v1Router } from '../routes'
import express from 'express'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

app.use(express.json())

app.use('/api/', v1Router)

export default app
