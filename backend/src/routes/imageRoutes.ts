import express from 'express';
import { getTile } from '../controllers/imageController';

const router = express.Router();

router.get('/get_tile', getTile);

export default router; 