import React, { useState, useEffect } from 'react';
import { Card, Spin, message } from 'antd';
import ComponentBanner from './ComponentBanner';
import ComponentExplanation from './ComponentExplanation';

const CoExpressionNetworks = ({ selectedCells = [], selectedGenes = [] }) => {
    console.log('Received selectedCells:', selectedCells);
    console.log('Received selectedGenes:', selectedGenes);
    
    const [analysis, setAnalysis] = useState({
        selected_cells: selectedCells.length > 0 ? selectedCells : ['Keratinocyte', 'Fibroblast', 'Melanocyte'],
        selected_genes: selectedGenes.length > 0 ? selectedGenes : ['COL1A1', 'KRT14', 'TYR'],
        coexpression_analysis: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedCells.length > 0 && selectedGenes.length > 0) {
            setLoading(true);
            try {
                console.log('Sending request with cells:', selectedCells, 'and genes:', selectedGenes);
                // Fetch BioBERT analysis from backend
                fetch('/analyze_coexpression', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        cells: selectedCells,
                        genes: selectedGenes
                    })
                })
                .then(response => {
                    console.log('Response status:', response.status);
                    return response.json();
                })
                .then(data => {
                    console.log('Received data:', data);
                    setAnalysis({
                        selected_cells: selectedCells,
                        selected_genes: selectedGenes,
                        coexpression_analysis: data.analysis
                    });
                })
                .catch(error => {
                    console.error('Error details:', error);
                    message.error('Failed to fetch Co-expression analysis');
                });
            } catch (error) {
                console.error('Error details:', error);
                message.error('Failed to process Co-expression analysis');
            } finally {
                setLoading(false);
            }
        } else {
            console.log('No cells or genes selected');
            setAnalysis({
                selected_cells: [],
                selected_genes: [],
                coexpression_analysis: 'Please select cells and genes to analyze.'
            });
        }
    }, [selectedCells, selectedGenes]);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', marginTop: '0', paddingTop: '0' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '0', paddingTop: '0' }}>
                <ComponentBanner title="Co-expression Networks" />
                <ComponentExplanation 
                    title="Co-expression Networks"
                    explanation="Co-expression networks or clusters are groups of genes that exhibit similar expression patterns across samples, indicating potential functional relationships or co-regulation."
                />
            </div>
            <Card style={{ flex: 1, overflow: 'auto', marginTop: '0', paddingTop: '0' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', marginTop: '0', paddingTop: '0' }}>
                        <Spin size="large" />
                    </div>
                ) : (
                    <div style={{ textAlign: 'left', marginTop: '0', paddingTop: '0' }}>
                        <p style={{ textAlign: 'left', marginTop: '0', paddingTop: '0' }}><strong>Selected Cells:</strong> {analysis.selected_cells.join(', ')}</p>
                        <p style={{ textAlign: 'left', marginTop: '0', paddingTop: '0' }}><strong>Selected Genes:</strong> {analysis.selected_genes.join(', ')}</p>
                        <h3 style={{ textAlign: 'left', fontWeight: 'bold', marginTop: '0', paddingTop: '0' }}>Co-expression Analysis:</h3>
                        <div style={{ 
                            whiteSpace: 'pre-wrap',
                            textAlign: 'justify',
                            textJustify: 'inter-word',
                            marginTop: '0',
                            paddingTop: '0'
                        }}>
                            {analysis.coexpression_analysis ? (
                                analysis.coexpression_analysis.split('\n').map((line, index) => {
                                    if (line.match(/^\d+\.\s+[A-Za-z\s]+:$/) || line.match(/^[A-Za-z\s]+:$/)) {
                                        return <p key={index} style={{ marginTop: '0', paddingTop: '0' }}><strong>{line}</strong></p>;
                                    }
                                    return <p key={index} style={{ marginTop: '0', paddingTop: '0' }}>{line}</p>;
                                })
                            ) : (
                                <p>No co-expression analysis available yet.</p>
                            )}
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default CoExpressionNetworks; 