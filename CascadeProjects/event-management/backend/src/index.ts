import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './database/db';
import { authRoutes } from './routes/auth.routes';
import { eventRoutes } from './routes/event.routes';

// Load environment variables
dotenv.config();

// Initialize database
db.connect();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
