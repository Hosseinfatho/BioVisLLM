import React, { useState, useEffect } from 'react';
import { Card, Spin, message, Popover } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import ComponentBanner from './ComponentBanner';

const PathwayEnrichment = ({ selectedCells, selectedGenes }) => {
    const [analysis, setAnalysis] = useState({
        selected_cells: [],
        selected_genes: [],
        go_analysis: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log('PathwayEnrichment - Received selectedCells:', selectedCells);
        console.log('PathwayEnrichment - Received selectedGenes:', selectedGenes);

        const fetchAnalysis = async () => {
            const topCells = selectedCells || [];
            const topGenes = selectedGenes || [];

            console.log('PathwayEnrichment - Sending Cells:', topCells);
            console.log('PathwayEnrichment - Sending Genes:', topGenes);

            if (topCells.length > 0 && topGenes.length > 0) {
                setLoading(true);
                try {
                    const response = await fetch('http://localhost:5003/generate_go_analysis', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            selected_cells: topCells,
                            selected_genes: topGenes
                        })
                    });

                    const data = await response.json();
                    if (data.error) {
                        message.error(data.error);
                        setAnalysis({
                            selected_cells: topCells,
                            selected_genes: topGenes,
                            go_analysis: ''
                        });
                    } else {
                        setAnalysis(data);
                    }
                } catch (error) {
                    message.error('Failed to fetch Pathway/Functional Enrichment analysis');
                    console.error('Error:', error);
                    setAnalysis({
                        selected_cells: topCells,
                        selected_genes: topGenes,
                        go_analysis: ''
                    });
                } finally {
                    setLoading(false);
                }
            } else {
                setAnalysis({
                    selected_cells: selectedCells || [],
                    selected_genes: selectedGenes || [],
                    go_analysis: ''
                });
                setLoading(false);
            }
        };

        fetchAnalysis();
    }, [selectedCells, selectedGenes]);

    const formatAnalysisText = (text) => {
        if (!text) return null;
        return text.split('\n').map((line, index) => {
            if (line.match(/^\d+\.\s+.*?:$/) || line.match(/^[A-Za-z\s]+:/)) {
                return <p key={index} style={{ marginTop: '0', paddingTop: '0', marginBottom: '0.5em' }}><strong>{line}</strong></p>;
            }
            return <p key={index} style={{ marginTop: '0', paddingTop: '0', marginBottom: '0.5em' }}>{line}</p>;
        });
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <ComponentBanner title="3. Pathway and Functional Enrichment" />
                <Popover
                    content={
                        <div style={{ maxWidth: '300px' }}>
                            <p>A method to identify biological pathways or functions that are overrepresented in a set of genes compared to a reference background.</p>
                        </div>
                    }
                    title="What is Pathway and Functional Enrichment?"
                    trigger="click"
                >
                    <QuestionCircleOutlined
                        style={{
                            marginLeft: '10px',
                            fontSize: '16px',
                            color: '#1890ff',
                            cursor: 'pointer'
                        }}
                    />
                </Popover>
            </div>
            <Card style={{ flex: 1, overflow: 'auto' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Spin size="large" />
                    </div>
                ) : (
                    <div style={{ textAlign: 'left', marginTop: '0', paddingTop: '0' }}>
                        <p style={{ textAlign: 'left', marginTop: '0', paddingTop: '0', marginBottom: '0.5em' }}>
                            <strong>Selected Cells:</strong> {analysis.selected_cells.join(', ') || 'None'}
                        </p>
                        <p style={{ textAlign: 'left', marginTop: '0', paddingTop: '0', marginBottom: '1em' }}>
                            <strong>Selected Genes:</strong> {analysis.selected_genes.join(', ') || 'None'}
                        </p>

                        {analysis.selected_cells.length > 0 && analysis.selected_genes.length > 0 ? (
                            <>
                                <h3 style={{ textAlign: 'left', fontWeight: 'bold', marginTop: '0', paddingTop: '0', marginBottom: '0.5em' }}>
                                    Analysis:
                                </h3>
                                <div style={{
                                    whiteSpace: 'pre-wrap',
                                    textAlign: 'justify',
                                    textJustify: 'inter-word',
                                    marginTop: '0',
                                    paddingTop: '0'
                                }}>
                                    {analysis.go_analysis ? formatAnalysisText(analysis.go_analysis) : 'No analysis available yet.'}
                                </div>
                            </>
                        ) : (
                            <p style={{ marginTop: '0', paddingTop: '0' }}>Please select cells and genes to analyze.</p>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default PathwayEnrichment; 