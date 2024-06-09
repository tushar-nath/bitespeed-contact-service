import { Request, Response, Router } from 'express'
import { identify } from '../handlers/contactHandler'

export const v1Router = Router()

v1Router.get('/', (_req: Request, res: Response) => {
  return res.send('Welcome to Bitespeed Contact Service!')
})
v1Router.get('/healthcheck', (_req: Request, res: Response) => {
  res.send({ success: true })
})
v1Router.post('/identify', identify)
