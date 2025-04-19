// frontend/src/components/DiseaseImmuneRelevance.js
import React, { useState, useEffect } from 'react';
import { Card, Spin, message } from 'antd';
import ComponentBanner from './ComponentBanner';
import ComponentExplanation from './ComponentExplanation';

const DiseaseImmuneRelevance = ({ selectedCells = [], selectedGenes = [] }) => {
    const [analysisState, setAnalysisState] = useState({
        // State to store the analysis result
        analysis_text: ''
    });
    const [loading, setLoading] = useState(false);

    // Determine top 5 for potential analysis and display
    const top5Cells = (selectedCells || []).slice(0, 5);
    const top5Genes = (selectedGenes || []).slice(0, 5);

    useEffect(() => {
        console.log('DiseaseImmuneRelevance - Effect Triggered. Top 5 Cells:', top5Cells);
        console.log('DiseaseImmuneRelevance - Effect Triggered. Top 5 Genes:', top5Genes);

        if (top5Cells.length > 0 && top5Genes.length > 0) {
            setLoading(true);
            // Clear previous analysis text
            setAnalysisState({ analysis_text: '' });

            // --- Fetch analysis from backend ---
            // TODO: Update endpoint if necessary for disease/immune relevance analysis
            const endpoint = '/analyze_disease_relevance'; // Make sure this matches your new route in server.py
            console.log(`Fetching ${endpoint} with top ${top5Cells.length} cells and top ${top5Genes.length} genes.`);

            fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cells: top5Cells, genes: top5Genes })
            })
            .then(response => {
                 if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                 const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) return response.json();
                throw new Error("Received non-JSON response");
             })
            .then(data => {
                console.log('DiseaseImmuneRelevance - Received data:', data);
                // Assuming backend returns { analysis: "Paragraph..." } or { logfc_analysis: "..." }
                setAnalysisState({ analysis_text: data.analysis || data.logfc_analysis || 'Analysis paragraph not found in response.' });
            })
            .catch(error => {
                message.error(`Failed to fetch Disease/Immune Relevance analysis: ${error.message}`);
                console.error('Error:', error);
                setAnalysisState({ analysis_text: '' }); // Clear on error
            })
            .finally(() => {
                setLoading(false);
            });
            // --- End fetch ---

        } else {
            // No fetch needed, clear analysis text
            setAnalysisState({ analysis_text: '' });
            setLoading(false);
            console.log('DiseaseImmuneRelevance - Not enough cells or genes selected.');
        }
    // Depend on the original props
    }, [selectedCells, selectedGenes]);

     const formatAnalysisText = (text) => {
        if (!text) return <p>No analysis available yet.</p>;
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
                    explanation="Investigates the potential connection of the top 5 selected genes and spatial patterns to specific diseases (e.g., cancer, autoimmune disorders) or immune cell infiltration and activity, based on the top 5 selected cells." // Updated explanation
                />
            </div>
            <Card style={{ flex: 1, overflow: 'auto' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Spin size="large" />
                    </div>
                ) : (
                     <div style={{ textAlign: 'left', marginTop: '0', paddingTop: '0' }}>
                         {/* Display top 5 directly from props */}
                        <p style={{ textAlign: 'left', marginTop: '0', paddingTop: '0', marginBottom: '0.5em' }}>
                            <strong>Top 5 Selected Cells:</strong> {top5Cells.join(', ') || 'None'}
                        </p>
                        <p style={{ textAlign: 'left', marginTop: '0', paddingTop: '0', marginBottom: '1em' }}>
                            <strong>Top 5 Selected Genes:</strong> {top5Genes.join(', ') || 'None'}
                        </p>

                        {/* Show analysis section only if there are selections */}
                        {(top5Cells.length > 0 && top5Genes.length > 0) ? (
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
                                     {/* Use analysis state and formatter */}
                                    {formatAnalysisText(analysisState.analysis_text)}
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

export default DiseaseImmuneRelevance;