import 'reflect-metadata'
import { v1Router } from '../routes'
import { DataSource } from 'typeorm'
import express from 'express'
import { Contact } from '../models/'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

app.use(express.json())

app.use('/api/', v1Router)

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Contact],
  synchronize: true,
  logging: false,
  ssl: {
    rejectUnauthorized: false,
  },
})

export default app
