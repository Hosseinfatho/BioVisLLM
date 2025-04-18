// frontend/src/components/DiseaseImmuneRelevance.js
import React, { useState, useEffect } from 'react';
import { Card, Spin, message } from 'antd';
import ComponentBanner from './ComponentBanner';
import ComponentExplanation from './ComponentExplanation';

// Renamed component and updated titles
const DiseaseImmuneRelevance = ({ selectedCells = [], selectedGenes = [] }) => {
    const [analysis, setAnalysis] = useState({
        selected_cells: [],
        selected_genes: [],
        logfc_analysis: '' // Keep state variable name or change if desired
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log('DiseaseImmuneRelevance - Received selectedCells:', selectedCells);
        console.log('DiseaseImmuneRelevance - Received selectedGenes:', selectedGenes);

        if (selectedCells && selectedCells.length > 0 && selectedGenes && selectedGenes.length > 0) {
            setLoading(true);
            try {
                const cells = selectedCells; // Use all selected
                const genes = selectedGenes; // Use all selected

                console.log('DiseaseImmuneRelevance - Sending cells:', cells);
                console.log('DiseaseImmuneRelevance - Sending genes:', genes);

                // TODO: Update endpoint if necessary for disease/immune relevance analysis
                fetch('/analyze_logfc', { // Keep endpoint or update
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cells, genes })
                })
                .then(response => {
                     if (!response.ok) {
                         throw new Error(`HTTP error! status: ${response.status}`);
                     }
                     const contentType = response.headers.get("content-type");
                    if (contentType && contentType.indexOf("application/json") !== -1) {
                        return response.json();
                    } else {
                        return response.text().then(text => { throw new Error("Received non-JSON response: " + text) });
                    }
                 })
                .then(data => {
                    console.log('DiseaseImmuneRelevance - Received data:', data);
                    // Assuming backend returns { selected_cells, selected_genes, logfc_analysis / analysis }
                    setAnalysis({
                        selected_cells: data.selected_cells || cells,
                        selected_genes: data.selected_genes || genes,
                        logfc_analysis: data.analysis || 'Analysis data missing.' // Use 'analysis' key if backend provides it
                    });
                })
                .catch(error => {
                    message.error(`Failed to fetch Disease/Immune Relevance analysis: ${error.message}`);
                    console.error('Error:', error);
                    setAnalysis({ // Clear on error
                         selected_cells: cells,
                         selected_genes: genes,
                         logfc_analysis: ''
                     });
                })
                .finally(() => {
                    setLoading(false);
                });
            } catch (error) {
                message.error('Failed to process Disease/Immune Relevance analysis');
                console.error('Error:', error);
                setAnalysis({ // Clear on error
                     selected_cells: selectedCells || [],
                     selected_genes: selectedGenes || [],
                     logfc_analysis: ''
                 });
                setLoading(false);
            }
        } else {
            // Clear analysis if no cells/genes selected
            setAnalysis({
                selected_cells: selectedCells || [],
                selected_genes: selectedGenes || [],
                logfc_analysis: ''
            });
            console.log('DiseaseImmuneRelevance - No cells or genes selected');
            setLoading(false); // Ensure loading is set to false
        }
    }, [selectedCells, selectedGenes]);

     const formatAnalysisText = (text) => {
        if (!text) return null;
        return text.split('\n').map((line, index) => {
            // Bold lines starting with number/dot or just text followed by colon
            if (line.match(/^\d+\.\s+.*?:$/) || line.match(/^[A-Za-z\s]+:/)) {
                return <p key={index} style={{ marginTop: '0', paddingTop: '0', marginBottom: '0.5em' }}><strong>{line}</strong></p>;
            }
            return <p key={index} style={{ marginTop: '0', paddingTop: '0', marginBottom: '0.5em' }}>{line}</p>;
        });
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <ComponentBanner title="5. Disease or Immune Relevance" />
                <ComponentExplanation
                    title="Disease or Immune Relevance"
                    explanation="The association of genes or molecular features with specific diseases or immune system functions and responses." // Update explanation
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
                                     {/* Use analysis state and formatter */}
                                    {analysis.logfc_analysis ? formatAnalysisText(analysis.logfc_analysis) : 'No analysis available yet.'}
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

export default DiseaseImmuneRelevance; // Update export name