// frontend/src/components/RegionalGeneCellRelationship.js
import React, { useState, useEffect } from 'react';
import { Card, Spin, message } from 'antd';
import ComponentBanner from './ComponentBanner';
import ComponentExplanation from './ComponentExplanation';

const RegionalGeneCellRelationship = ({ selectedCells = [], selectedGenes = [], selectedModel }) => {
    const [analysis, setAnalysis] = useState({
        selected_cells: [], // Store the cells sent for analysis
        selected_genes: [], // Store the genes sent for analysis
        analysis_text: '' // Store the received paragraph
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log('RegionalGeneCellRelationship - Received selectedCells:', selectedCells);
        console.log('RegionalGeneCellRelationship - Received selectedGenes:', selectedGenes);

        // --- Updated Logic: Use TOP 5 cells and TOP 5 genes ---
        const cellsToAnalyze = (selectedCells || []).slice(0, 5);
        const genesToAnalyze = (selectedGenes || []).slice(0, 5);
        // --- End Updated Logic ---

        if (cellsToAnalyze.length > 0 && genesToAnalyze.length > 0) {
            setLoading(true);
            setAnalysis(prev => ({ ...prev, selected_cells: cellsToAnalyze, selected_genes: genesToAnalyze, analysis_text: '' }));

            // Define the specific question for this component
            const componentQuestion = `What is the regional gene-cell relationship involving these cells (${cellsToAnalyze.join(', ')}) and these genes (${genesToAnalyze.join(', ')})?`;

            const endpoint = '/analyze_regional_relationship';
            console.log(`Fetching ${endpoint} for Regional Relationship`);

            fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Send question along with cells and genes
                body: JSON.stringify({ question: componentQuestion, cells: cellsToAnalyze, genes: genesToAnalyze, selectedModel: selectedModel })
            })
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) return response.json();
                throw new Error("Received non-JSON response");
            })
            .then(data => {
                console.log('RegionalGeneCellRelationship - Received data:', data);
                // Assuming backend returns { analysis: "Paragraph..." }
                setAnalysis(prev => ({ ...prev, analysis_text: data.analysis || 'Analysis paragraph not found in response.' }));
            })
            .catch(error => {
                message.error(`Failed to fetch Regional Relationship analysis: ${error.message}`);
                console.error('Error:', error);
                setAnalysis(prev => ({ ...prev, analysis_text: '' })); // Clear analysis on error
            })
            .finally(() => {
                setLoading(false);
            });
            // --- End fetch ---

        } else {
             // Clear analysis and display lists if not enough cells/genes selected
             setAnalysis({
                 selected_cells: cellsToAnalyze, // Show which cells would have been sent
                 selected_genes: genesToAnalyze, // Show which genes would have been sent
                 analysis_text: ''
             });
            setLoading(false);
            console.log('RegionalGeneCellRelationship - Not enough cells or genes selected.');
        }
    }, [selectedCells, selectedGenes, selectedModel]);

    // Simple paragraph display
    const formatAnalysisText = (text) => {
       if (!text) return <p>No analysis available yet.</p>;
       return <p style={{ marginTop: '0', paddingTop: '0', marginBottom: '0.5em' }}>{text}</p>;
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <ComponentBanner title="1. Regional Gene-Cell Relationship" />
                <ComponentExplanation
                    title="Regional Gene-Cell Relationship"
                    explanation="Analyzes the relationship between gene expression and specific cell types within selected spatial regions, based on top 5 selected cells and top 5 selected genes." // Updated explanation
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
                            <strong>Top 5 Selected Cells:</strong> {analysis.selected_cells.join(', ') || 'None'}
                        </p>
                        <p style={{ textAlign: 'left', marginTop: '0', paddingTop: '0', marginBottom: '1em' }}>
                            <strong>Top 5 Selected Genes:</strong> {analysis.selected_genes.join(', ') || 'None'}
                        </p>

                        {(analysis.selected_cells.length > 0 && analysis.selected_genes.length > 0) ? (
                            <>
                                <h3 style={{ textAlign: 'left', fontWeight: 'bold', marginTop: '0', paddingTop: '0', marginBottom: '0.5em' }}>
                                    BioBERT Analysis:
                                </h3>
                                <div style={{
                                    whiteSpace: 'pre-wrap',
                                    textAlign: 'justify',
                                    textJustify: 'inter-word',
                                    marginTop: '0',
                                    paddingTop: '0'
                                }}>
                                    {formatAnalysisText(analysis.analysis_text)}
                                </div>
                            </>
                        ) : (
                             <p style={{ marginTop: '0', paddingTop: '0' }}>Please select at least 1 cell and 1 gene to analyze.</p> // Updated message
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default RegionalGeneCellRelationship;