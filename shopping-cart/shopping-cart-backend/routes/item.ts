import express, { Router, type Application, type Request, type Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();
const router = Router()
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' })
const prisma = new PrismaClient({ adapter })

router.get('/', async (req: Request, res: Response) => {
  try {
    const items = await prisma.item.findMany({
      orderBy: { createdAt: 'desc' }
    })
    res.json(items)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch items' })
  }
})

router.post('/', async (req: Request, res: Response) => {
  const { title, image, price, store, url } = req.body
  try {
    const item = await prisma.item.create({
      data: { title, image, price, store, url }
    })
    res.json(item)
  } catch (error) {
    res.status(500).json({ error: 'Failed to save item' })
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.item.delete({
      where: { id: req.params.id }
    })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete item' })
  }
})

export default router