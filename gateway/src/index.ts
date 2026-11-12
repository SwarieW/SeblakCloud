import express, { Request } from 'express';
import proxy from 'express-http-proxy';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

const AUTH_SERVICE_HOST = process.env.AUTH_SERVICE_HOST || 'http://localhost:4000';
const MAIN_SERVICE_HOST = process.env.MAIN_SERVICE_HOST || 'http://localhost:4001';

app.use(cors());
app.use(express.json());

// Serve Frontend Static Files
app.use(express.static(path.join(__dirname, '../public')));

// Reverse Proxy API Routes with explicit Request types
app.use('/api/auth', proxy(AUTH_SERVICE_HOST, {
  proxyReqPathResolver: (req: Request) => `/api/auth${req.url}`
}));

app.use('/api/canteen', proxy(MAIN_SERVICE_HOST, {
  proxyReqPathResolver: (req: Request) => `/api/canteen${req.url}`
}));

app.listen(PORT, () => {
  console.log(`🌐 Gateway & UI Service listening on http://localhost:${PORT}`);
});

app.get('/api/health', (req, res) => res.status(200).json({ service: 'Gateway', status: 'UP', port: 8080 }));