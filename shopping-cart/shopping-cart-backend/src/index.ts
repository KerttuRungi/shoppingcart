import 'dotenv/config';
import express, { type Application, type Request, type Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import itemsRouter from './routes/item.js'
import scrapeRouter from './routes/scrape.js'
import 'dotenv/config'

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

const adapter = new PrismaPg({
  connectionString: DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const app: Application = express();

app.use(
  cors({
    origin: 'http://localhost:3000',
  })
);

app.use(express.json());

// app.get('/api/health', (_req: Request, res: Response) => {
//   res.status(200).json({
//     status: 'ok',
//   });
// });

app.use(express.json())

app.use('/api/items', itemsRouter)
app.use('/api/scrape', scrapeRouter)

const PORT: number = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
