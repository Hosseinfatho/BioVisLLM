import React, { useState, useEffect } from 'react';
import { Card, Spin, message } from 'antd';
import ComponentBanner from './ComponentBanner';
import ComponentExplanation from './ComponentExplanation';

const StatisticalSignificance = ({ selectedCells = [], selectedGenes = [] }) => {
    const [analysis, setAnalysis] = useState({
        selected_cells: selectedCells.length > 0 ? selectedCells : ['Keratinocyte', 'Fibroblast', 'Melanocyte'],
        selected_genes: selectedGenes.length > 0 ? selectedGenes : ['COL1A1', 'KRT14', 'TYR'],
        significance_analysis: `Statistical analysis of the selected cell types and genes reveals:

1. P-values:
- COL1A1: p < 0.001 in Fibroblasts vs other cell types
- KRT14: p < 0.0001 in Keratinocytes vs other cell types
- TYR: p < 0.0001 in Melanocytes vs other cell types
2. Adjusted p-values (FDR):
- All significant differences remain after multiple testing correction
- FDR < 0.05 for all comparisons
The analysis indicates that the observed expression differences are statistically significant and not due to random chance, with strong evidence supporting cell-type specific expression patterns.`
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedCells.length > 0 && selectedGenes.length > 0) {
            setLoading(true);
            try {
                const cells = selectedCells.length > 0 ? selectedCells : ['Keratinocyte', 'Fibroblast', 'Melanocyte'];
                const genes = selectedGenes.length > 0 ? selectedGenes : ['COL1A1', 'KRT14', 'TYR'];
                
                // Fetch BioBERT analysis from backend
                fetch('/analyze_significance', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        cells: cells,
                        genes: genes
                    })
                })
                .then(response => response.json())
                .then(data => {
                    setAnalysis({
                        selected_cells: cells,
                        selected_genes: genes,
                        significance_analysis: data.analysis
                    });
                })
                .catch(error => {
                    message.error('Failed to fetch Statistical Significance analysis');
                    console.error('Error:', error);
                });
            } catch (error) {
                message.error('Failed to process Statistical Significance analysis');
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        }
    }, [selectedCells, selectedGenes]);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <ComponentBanner title="Statistical Significance" />
                <ComponentExplanation 
                    title="Statistical Significance"
                    explanation="Statistical significance is assessed using p-values and adjusted p-values (FDR) to determine whether observed gene expression changes are likely due to chance or are truly meaningful."
                />
            </div>
            <Card style={{ flex: 1, overflow: 'auto' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Spin size="large" />
                    </div>
                ) : (
                    <div style={{ textAlign: 'left' }}>
                        <h3 style={{ textAlign: 'left', marginTop: '0', paddingTop: '0' }}>Significance Analysis:</h3>
                        <div style={{ 
                            whiteSpace: 'pre-wrap',
                            textAlign: 'justify',
                            textJustify: 'inter-word'
                        }}>
                            {analysis.significance_analysis.split('\n').map((line, index) => {
                                if (line.match(/^\d+\.\s+[A-Za-z\s]+:$/) || line.match(/^[A-Za-z\s]+\([A-Za-z]+\):$/)) {
                                    return <p key={index}><strong>{line}</strong></p>;
                                }
                                return <p key={index}>{line}</p>;
                            })}
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default StatisticalSignificance; 