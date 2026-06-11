import 'dotenv/config';
import express, { type Application, type Request, type Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

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

app.get('/api/health', (_req: Request, res: Response) => {
   res.status(200).json({
     status: 'ok',
   });
 });

