import React, { useState, useEffect } from 'react';
import { Card, Spin, message } from 'antd';
import ComponentBanner from './ComponentBanner';
import ComponentExplanation from './ComponentExplanation';

const LogFoldChange = ({ selectedCells = [], selectedGenes = [] }) => {
    const [analysis, setAnalysis] = useState({
        selected_cells: selectedCells.length > 0 ? selectedCells : ['Keratinocyte', 'Fibroblast', 'Melanocyte'],
        selected_genes: selectedGenes.length > 0 ? selectedGenes : ['COL1A1', 'KRT14', 'TYR'],
        logfc_analysis: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedCells.length > 0 && selectedGenes.length > 0) {
            setLoading(true);
            try {
                const cells = selectedCells.length > 0 ? selectedCells : ['Keratinocyte', 'Fibroblast', 'Melanocyte'];
                const genes = selectedGenes.length > 0 ? selectedGenes : ['COL1A1', 'KRT14', 'TYR'];
                
                // Fetch BioBERT analysis from backend
                fetch('/analyze_logfc', {
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
                        logfc_analysis: data.analysis
                    });
                })
                .catch(error => {
                    message.error('Failed to fetch LogFC analysis');
                    console.error('Error:', error);
                });
            } catch (error) {
                message.error('Failed to process LogFC analysis');
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        }
    }, [selectedCells, selectedGenes]);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <ComponentBanner title="Log Fold Change" />
                <ComponentExplanation 
                    title="Log Fold Change"
                    explanation="Log Fold Change (LogFC) is the logarithm (usually base 2) of the ratio of gene expression levels between two conditions, indicating the direction and magnitude of expression change."
                />
            </div>
            <Card style={{ flex: 1, overflow: 'auto' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Spin size="large" />
                    </div>
                ) : (
                    <div style={{ textAlign: 'left' }}>
                        <h3 style={{ textAlign: 'left' }}>Selected Cells:</h3>
                        <p style={{ textAlign: 'left' }}>{analysis.selected_cells.join(', ')}</p>
                        <h3 style={{ textAlign: 'left' }}>Selected Genes:</h3>
                        <p style={{ textAlign: 'left' }}>{analysis.selected_genes.join(', ')}</p>
                        <h3 style={{ textAlign: 'left' }}>LogFC Analysis:</h3>
                        <div style={{ 
                            whiteSpace: 'pre-wrap',
                            textAlign: 'justify',
                            textJustify: 'inter-word'
                        }}>
                            {analysis.logfc_analysis}
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default LogFoldChange; 