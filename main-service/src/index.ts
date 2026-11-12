import express, { Application } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import canteenRoutes from './routes/kantinA';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

// Mount Canteen Routes
app.use('/', canteenRoutes);

const startServer = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI missing');

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB (Canteen DB)');

    app.listen(PORT, () => {
      console.log(`🚀 Main Service listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

app.get('/api/canteen/health', (req, res) => res.status(200).json({ service: 'Canteen Core', status: 'UP', port: 4001 }));

startServer();