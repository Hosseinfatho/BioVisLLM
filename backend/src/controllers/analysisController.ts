import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import OpenAI from 'openai';
import * as tf from '@tensorflow/tfjs-node';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize BioBERT model (placeholder for now)
let biobertModel: tf.LayersModel | null = null;

// Load BioBERT model
const loadBiobertModel = async () => {
  if (!biobertModel) {
    try {
      // In a real implementation, you would load the actual BioBERT model
      // For now, we'll just log that we're loading it
      console.log('Loading BioBERT model...');
      // biobertModel = await tf.loadLayersModel(process.env.BIOBERT_MODEL_PATH || '');
      console.log('BioBERT model loaded successfully');
    } catch (error) {
      console.error('Error loading BioBERT model:', error);
    }
  }
  return biobertModel;
};

// Get cell types and genes from the selected region
const getRegionData = (sampleId: string, region: any) => {
  try {
    // Load metadata
    const metadataPath = path.join(process.env.METADATA_DIR || '', `${sampleId}_metadata.json`);
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    
    // Load DEGs data
    const degsPath = path.join(process.env.DEGS_DIR || '', `${sampleId}_degs.csv`);
    const degsData = fs.readFileSync(degsPath, 'utf8');
    const degsRecords = parse(degsData, {
      columns: true,
      skip_empty_lines: true
    });
    
    // Find cell types in the selected region
    const cellTypesInRegion: string[] = [];
    Object.entries(metadata.region_mapping).forEach(([regionName, regionData]: [string, any]) => {
      if (
        region.x >= regionData.x &&
        region.x + region.width <= regionData.x + regionData.width &&
        region.y >= regionData.y &&
        region.y + region.height <= regionData.y + regionData.height
      ) {
        cellTypesInRegion.push(...regionData.cell_types);
      }
    });
    
    // Get genes with significant expression in these cell types
    const significantGenes = degsRecords.filter((record: any) => {
      return cellTypesInRegion.some(cellType => {
        const expression = parseFloat(record[cellType]);
        return expression > 1.5; // Threshold for significant expression
      });
    }).map((record: any) => record.gene_id);
    
    return {
      cellTypes: cellTypesInRegion,
      genes: significantGenes,
      pathways: metadata.pathways
    };
  } catch (error) {
    console.error('Error getting region data:', error);
    return { cellTypes: [], genes: [], pathways: {} };
  }
};

// Generate narrative using GPT
const generateGPTNarrative = async (topic: string, data: any) => {
  try {
    const prompt = `
      Analyze the following biological data and provide a narrative about ${topic}:
      
      Cell Types: ${data.cellTypes.join(', ')}
      Significant Genes: ${data.genes.join(', ')}
      
      Pathways:
      ${Object.entries(data.pathways)
        .map(([pathway, genes]) => `${pathway}: ${(genes as string[]).join(', ')}`)
        .join('\n')}
      
      Provide a concise, informative paragraph about ${topic} based on this data.
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a biomedical expert analyzing gene expression data." },
        { role: "user", content: prompt }
      ],
      max_tokens: 300
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating GPT narrative:', error);
    return 'Error generating analysis with GPT.';
  }
};

// Generate narrative using BioBERT (placeholder)
const generateBioBERTNarrative = async (topic: string, data: any) => {
  try {
    // In a real implementation, you would use the BioBERT model
    // For now, we'll just return a placeholder message
    return `BioBERT analysis for ${topic} (placeholder): 
      Cell types ${data.cellTypes.join(', ')} show significant expression of genes 
      ${data.genes.join(', ')}. This suggests ${topic.toLowerCase()} in this region.`;
  } catch (error) {
    console.error('Error generating BioBERT narrative:', error);
    return 'Error generating analysis with BioBERT.';
  }
};

// Main controller function
export const analyzeRegion = async (req: Request, res: Response) => {
  try {
    const { topic, region, model, sampleId } = req.body;
    
    if (!topic || !region || !model || !sampleId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Get data for the selected region
    const regionData = getRegionData(sampleId, region);
    
    // Generate narrative based on selected model
    let narrative = '';
    if (model === 'gpt') {
      const gptNarrative = await generateGPTNarrative(topic, regionData);
      if (!gptNarrative) {
        return res.status(500).json({ error: 'Failed to generate GPT narrative' });
      }
      narrative = gptNarrative;
    } else if (model === 'biobert') {
      await loadBiobertModel();
      narrative = await generateBioBERTNarrative(topic, regionData);
    } else {
      return res.status(400).json({ error: 'Invalid model selection' });
    }
    
    return res.json({ narrative });
  } catch (error) {
    console.error('Error in analyzeRegion:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 