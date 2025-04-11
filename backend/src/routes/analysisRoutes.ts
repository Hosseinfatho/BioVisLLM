import express from 'express';
import { analyzeRegion } from '../controllers/analysisController';

const router = express.Router();

router.post('/analyze', analyzeRegion);

export default router; 