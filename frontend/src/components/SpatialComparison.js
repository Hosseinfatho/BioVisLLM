import React, { useState, useEffect } from 'react';
import { Card, Spin, message } from 'antd';
import ComponentBanner from './ComponentBanner';
import ComponentExplanation from './ComponentExplanation';

const SpatialComparison = ({ selectedCells, selectedGenes }) => {
    const [analysis, setAnalysis] = useState({
        selected_cells: [],
        selected_genes: [],
        significance_analysis: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log('SpatialComparison - Received selectedCells:', selectedCells);
        console.log('SpatialComparison - Received selectedGenes:', selectedGenes);

        if (selectedCells && selectedCells.length > 0 && selectedGenes && selectedGenes.length > 0) {
            setLoading(true);
             // TODO: Implement actual backend fetch logic here for spatial comparison
             // Example: fetch('/analyze_spatial_comparison', { ... })
             // For now, simulate a delay and set placeholder data
            setTimeout(() => {
                setAnalysis({
                    selected_cells: selectedCells,
                    selected_genes: selectedGenes,
                    significance_analysis: `BioBERT analysis for Spatial Comparison between regions based on ${selectedCells.join(', ')} and ${selectedGenes.join(', ')} goes here. \nIncludes statistical significance (p-values, FDR).`
                });
                setLoading(false);
            }, 1500); // Simulating network delay
        } else {
            // Clear analysis if no cells/genes are selected
            setAnalysis({
                selected_cells: selectedCells || [],
                selected_genes: selectedGenes || [],
                significance_analysis: ''
            });
            setLoading(false);
        }
    }, [selectedCells, selectedGenes]);

    const formatAnalysisText = (text) => {
        if (!text) return null;
        return text.split('\n').map((line, index) => {
             // Bold lines like "1. P-values:" or "Adjusted p-values (FDR):"
            if (line.match(/^\d+\.\s+.*?:$/) || line.match(/^[A-Za-z\s].*?:$/)) {
                return <p key={index} style={{ marginTop: '0', paddingTop: '0', marginBottom: '0.5em' }}><strong>{line}</strong></p>;
            }
            return <p key={index} style={{ marginTop: '0', paddingTop: '0', marginBottom: '0.5em' }}>{line}</p>;
        });
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <ComponentBanner title="2. Spatial Comparison Between Regions" />
                <ComponentExplanation
                    title="Spatial Comparison Between Regions"
                    explanation="Analyzing differences in gene expression or cell composition across distinct spatial areas within a tissue."
                />
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
                                    {analysis.significance_analysis ? formatAnalysisText(analysis.significance_analysis) : 'No analysis available yet.'}
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

export default SpatialComparison; 