import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import imageRoutes from './routes/imageRoutes';
import { getSamples, getCellTypes, getGeneList, getGeneExpression } from './controllers/imageController';

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

// Sample endpoints
app.get('/api/samples', getSamples);
app.post('/api/cell-types', getCellTypes);
app.post('/api/gene-list', getGeneList);
app.post('/api/gene-expression', getGeneExpression);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 