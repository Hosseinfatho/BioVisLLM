import React, { useState, useEffect } from 'react';
import { Card, Spin, message, Typography, Popover } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import ComponentBanner from './ComponentBanner';
import ComponentExplanation from './ComponentExplanation';

const { Text } = Typography;

const GOAnalysis = ({ selectedCells = [], selectedGenes = [] }) => {
    const [analysis, setAnalysis] = useState({
        selected_cells: selectedCells.length > 0 ? selectedCells : ['Keratinocyte', 'Fibroblast', 'Melanocyte'],
        selected_genes: selectedGenes.length > 0 ? selectedGenes : ['COL1A1', 'KRT14', 'TYR'],
        go_analysis: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedCells.length > 0 && selectedGenes.length > 0) {
            setLoading(true);
            try {
                // Fetch BioBERT analysis from backend
                fetch('/analyze_go', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        cells: selectedCells,
                        genes: selectedGenes
                    })
                })
                .then(response => response.json())
                .then(data => {
                    setAnalysis({
                        selected_cells: selectedCells,
                        selected_genes: selectedGenes,
                        go_analysis: data.analysis
                    });
                })
                .catch(error => {
                    message.error('Failed to fetch GO analysis');
                    console.error('Error:', error);
                });
            } catch (error) {
                message.error('Failed to process GO analysis');
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        }
    }, [selectedCells, selectedGenes]);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', marginTop: '0', paddingTop: '0' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '0', paddingTop: '0' }}>
                <ComponentBanner title="GO Analysis" />
                <ComponentExplanation 
                    title="GO Analysis"
                    explanation="GO Analysis is the process of identifying enriched Gene Ontology terms to understand the biological functions, processes, and cellular components associated with a set of genes."
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
                        <h3 style={{ textAlign: 'left', fontWeight: 'bold', marginTop: '0', paddingTop: '0' }}>GO Analysis:</h3>
                        <div style={{ 
                            whiteSpace: 'pre-wrap',
                            textAlign: 'justify',
                            textJustify: 'inter-word',
                            marginTop: '0',
                            paddingTop: '0'
                        }}>
                            {analysis.go_analysis ? (
                                analysis.go_analysis.split('\n').map((line, index) => {
                                    if (line.match(/^\d+\.\s+[A-Za-z\s]+:$/) || line.match(/^[A-Za-z\s]+:$/)) {
                                        return <p key={index} style={{ marginTop: '0', paddingTop: '0' }}><strong>{line}</strong></p>;
                                    }
                                    return <p key={index} style={{ marginTop: '0', paddingTop: '0' }}>{line}</p>;
                                })
                            ) : (
                                <p>No GO analysis available yet.</p>
                            )}
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default GOAnalysis; 