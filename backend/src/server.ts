import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import imageRoutes from './routes/imageRoutes';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Add image routes
app.use('/', imageRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 