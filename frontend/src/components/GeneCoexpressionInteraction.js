// frontend/src/components/GeneCoexpressionInteraction.js
import React, { useState, useEffect } from 'react';
import { Card, Spin, message } from 'antd';
import ComponentBanner from './ComponentBanner';
import ComponentExplanation from './ComponentExplanation';

// Renamed component and updated titles
const GeneCoexpressionInteraction = ({ selectedCells = [], selectedGenes = [] }) => {
    const [analysis, setAnalysis] = useState({
        selected_cells: [],
        selected_genes: [],
        coexpression_analysis: '' // Keep state variable name or change if desired
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log('GeneCoexpressionInteraction - Received selectedCells:', selectedCells);
        console.log('GeneCoexpressionInteraction - Received selectedGenes:', selectedGenes);

        if (selectedCells && selectedCells.length > 0 && selectedGenes && selectedGenes.length > 0) {
            setLoading(true);
            try {
                const cells = selectedCells; // Use all selected
                const genes = selectedGenes; // Use all selected

                console.log('GeneCoexpressionInteraction - Sending cells:', cells);
                console.log('GeneCoexpressionInteraction - Sending genes:', genes);

                 // TODO: Update endpoint if necessary for coexpression/interaction analysis
                fetch('/analyze_coexpression', { // Keep endpoint or update
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cells, genes })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    // Check if response is JSON before parsing
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.indexOf("application/json") !== -1) {
                        return response.json();
                    } else {
                        return response.text().then(text => { throw new Error("Received non-JSON response: " + text) });
                    }
                 })
                .then(data => {
                    console.log('GeneCoexpressionInteraction - Received data:', data);
                     // Assuming backend returns { selected_cells, selected_genes, coexpression_analysis }
                    setAnalysis({
                        selected_cells: data.selected_cells || cells, // Use data if available, else fallback
                        selected_genes: data.selected_genes || genes, // Use data if available, else fallback
                        coexpression_analysis: data.analysis || 'Analysis data missing from response.'
                    });
                })
                .catch(error => {
                    message.error(`Failed to fetch Gene Co-expression/Interaction analysis: ${error.message}`);
                    console.error('Error:', error);
                    setAnalysis({ // Clear analysis on error
                         selected_cells: cells,
                         selected_genes: genes,
                         coexpression_analysis: ''
                     });
                })
                .finally(() => {
                    setLoading(false);
                });
            } catch (error) {
                message.error('Failed to process Gene Co-expression/Interaction analysis');
                console.error('Error:', error);
                setAnalysis({ // Clear analysis on error
                     selected_cells: selectedCells || [],
                     selected_genes: selectedGenes || [],
                     coexpression_analysis: ''
                 });
                setLoading(false);
            }
        } else {
             // Clear analysis if no cells/genes selected
             setAnalysis({
                 selected_cells: selectedCells || [],
                 selected_genes: selectedGenes || [],
                 coexpression_analysis: ''
             });
            console.log('GeneCoexpressionInteraction - No cells or genes selected');
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
                <ComponentBanner title="4. Gene Co-expression and Interaction" />
                <ComponentExplanation
                    title="Gene Co-expression and Interaction"
                    explanation="Identifies groups of genes with correlated expression patterns (co-expression) across spatial regions and explores potential gene-gene interactions (e.g., using STRING DB)." // Update explanation
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
                                    {analysis.coexpression_analysis ? formatAnalysisText(analysis.coexpression_analysis) : 'No analysis available yet.'}
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

export default GeneCoexpressionInteraction; // Update export name