import React, { useState, useEffect } from 'react';
import { Card, Spin, message, Popover } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import ComponentBanner from './ComponentBanner';

const PathwayEnrichment = ({ selectedCells = [], selectedGenes = [] }) => {
    const [analysisState, setAnalysisState] = useState({
        analysis_text: ''
    });
    const [loading, setLoading] = useState(false);

    const top5Cells = (selectedCells || []).slice(0, 5);
    const top5Genes = (selectedGenes || []).slice(0, 5);

    useEffect(() => {
        console.log('PathwayEnrichment - Effect Triggered. Top 5 Cells:', top5Cells);
        console.log('PathwayEnrichment - Effect Triggered. Top 5 Genes:', top5Genes);

        if (top5Cells.length > 0 && top5Genes.length > 0) {
            setLoading(true);
            setAnalysisState({ analysis_text: '' });

            // Define the specific question for this component
            const componentQuestion = `Regarding pathway and functional enrichment, what roles do these genes (${top5Genes.join(', ')}) play in the context of these cells (${top5Cells.join(', ')})?`;

            const endpoint = '/analyze_pathway_enrichment';
            console.log(`Fetching ${endpoint} for Pathway Enrichment`);

            fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Send question along with cells and genes
                body: JSON.stringify({ question: componentQuestion, cells: top5Cells, genes: top5Genes })
            })
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) return response.json();
                throw new Error("Received non-JSON response");
            })
            .then(data => {
                console.log('PathwayEnrichment - Received data:', data);
                setAnalysisState({ analysis_text: data.analysis || 'Analysis paragraph not found in response.' });
            })
            .catch(error => {
                message.error(`Failed to fetch Pathway Enrichment analysis: ${error.message}`);
                console.error('Error:', error);
                setAnalysisState({ analysis_text: '' });
            })
            .finally(() => {
                setLoading(false);
            });

        } else {
            setAnalysisState({ analysis_text: '' });
            setLoading(false);
            console.log('PathwayEnrichment - Not enough cells or genes selected.');
        }
    }, [selectedCells, selectedGenes]);

    const formatAnalysisText = (text) => {
        if (!text) return <p>No analysis available yet.</p>;
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
                            <p>Identifies enriched biological pathways (e.g., KEGG, Reactome) and Gene Ontology (GO) terms to understand the functional roles of the top 5 selected genes in the context of the top 5 selected cells.</p>
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
                            <strong>Top 5 Selected Cells:</strong> {top5Cells.join(', ') || 'None'}
                        </p>
                        <p style={{ textAlign: 'left', marginTop: '0', paddingTop: '0', marginBottom: '1em' }}>
                            <strong>Top 5 Selected Genes:</strong> {top5Genes.join(', ') || 'None'}
                        </p>

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

export default PathwayEnrichment; 