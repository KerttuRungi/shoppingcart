import {Router, Request, Response } from 'express';
import { scrapeProduct } from '../scraper.js';

const router = Router()

router.post('/', async (req: Request, res: Response) => {
    const { url } = req.body

    if (!url) {
        return res.status(400).json({ error: 'URL is required' })
    }

    try {
        const product = await scrapeProduct(url)
        res.json(product)
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown scrape error'
        console.error('Failed to scrape product:', message)

        const status = message.startsWith('Invalid URL') ? 400 : 502
        res.status(status).json({ error: 'Failed to scrape product', details: message })
    }
})

export default router
