import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDB } from './db';
import authRoutes from './routes/auth';
import { authenticateJWT, authorizeRole, AuthRequest } from './middleware/auth';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Mount the authentication routes
app.use('/api/auth', authRoutes);

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, async () => {
  console.log(`Auth Service listening on http://localhost:${PORT}`);
  await initializeDB();
});

app.get(
  '/api/dashboard',
  authenticateJWT,
  authorizeRole(['admin']),
  (req: AuthRequest, res: Response) => {
    res.status(200).json({
      message: `Welcome to the Canteen Dashboard, ${req.user?.username}!`,
      system_status: 'All microservices running smoothly.'
    });
  }
);