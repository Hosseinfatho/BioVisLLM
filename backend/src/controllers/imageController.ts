import { Request, Response } from 'express';
import path from 'path';
import sharp from 'sharp';
import fs from 'fs';

const TILE_SIZE = 256;

// Define valid sample IDs type
type SampleId = 'skin_TXK6Z4X_A1' | 'skin_TXK6Z4X_D1';

// Map sample IDs to their corresponding TIFF files
const SAMPLE_TO_TIFF: Record<SampleId, string> = {
    'skin_TXK6Z4X_A1': 'H1-TXK6Z4X-A1_SK24-001_A1-4-003.tiff',
    'skin_TXK6Z4X_D1': 'H1-TXK6Z4X-D1_SK24-001_A1-5-004.tiff'
};

export const getTile = async (req: Request, res: Response) => {
    try {
        const { sample_id, x, y } = req.query;
        
        if (!sample_id || x === undefined || y === undefined) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const sampleIdStr = sample_id.toString();
        if (!Object.keys(SAMPLE_TO_TIFF).includes(sampleIdStr)) {
            return res.status(404).json({ error: 'Invalid sample ID' });
        }

        const tiffFilename = SAMPLE_TO_TIFF[sampleIdStr as SampleId];

        // Get the path to the TIFF file
        const tiffPath = path.join(process.cwd(), '..', 'data', tiffFilename);
        console.log('Attempting to read TIFF file:', tiffPath);
        
        if (!fs.existsSync(tiffPath)) {
            return res.status(404).json({ error: `Image not found at path: ${tiffPath}` });
        }

        // Calculate the region to extract
        const left = parseInt(x.toString()) * TILE_SIZE;
        const top = parseInt(y.toString()) * TILE_SIZE;

        // Extract and process the tile
        const image = sharp(tiffPath);
        const tile = await image
            .extract({ left, top, width: TILE_SIZE, height: TILE_SIZE })
            .toFormat('png')
            .toBuffer();

        // Send the tile
        res.setHeader('Content-Type', 'image/png');
        res.send(tile);
    } catch (error) {
        console.error('Error getting tile:', error);
        if (error instanceof Error) {
            res.status(500).json({ error: 'Internal server error', details: error.message });
        } else {
            res.status(500).json({ error: 'Internal server error', details: 'Unknown error occurred' });
        }
    }
}; 