import { Request, Response } from 'express'
import { identifyContact } from '../services/contactService'

export const identify = async (req: Request, res: Response) => {
  try {
    const response = await identifyContact(req.body)
    res.status(200).json(response)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}
