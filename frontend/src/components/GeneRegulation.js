import React, { useState, useEffect } from 'react';
import { Card, Spin, message } from 'antd';
import ComponentBanner from './ComponentBanner';
import ComponentExplanation from './ComponentExplanation';

const GeneRegulation = ({ selectedCells, selectedGenes }) => {
    const [analysis, setAnalysis] = useState({
        selected_cells: ['Keratinocyte', 'Fibroblast', 'Melanocyte'],
        selected_genes: ['COL1A1', 'KRT14', 'TYR'],
        regulation_analysis: `Based on the selected cell types and genes, the gene regulation analysis reveals:

1. Upregulated Genes:
- COL1A1: Shows increased expression in Fibroblasts, indicating active extracellular matrix production
- KRT14: Highly expressed in Keratinocytes, suggesting active epithelial cell maintenance
2. Downregulated Genes:
- TYR: Shows decreased expression in non-melanocyte cells, indicating cell-type specific regulation
The analysis suggests that these genes are tightly regulated in a cell-type specific manner, with clear patterns of upregulation and downregulation across different cell populations.`
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedCells.length > 0 && selectedGenes.length > 0) {
            setLoading(true);
            try {
                // Fetch analysis from backend
                // Similar to GOAnalysis component
            } catch (error) {
                message.error('Failed to fetch regulation analysis');
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        }
    }, [selectedCells, selectedGenes]);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <ComponentBanner title="Upregulated vs. Downregulated Genes" />
                <ComponentExplanation 
                    title="Upregulated vs. Downregulated Genes"
                    explanation="Upregulated and downregulated genes are those showing increased or decreased expression levels, respectively, under specific conditions compared to a control."
                />
            </div>
            <Card style={{ flex: 1, overflow: 'auto' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Spin size="large" />
                    </div>
                ) : (
                    <div style={{ textAlign: 'left' }}>

                        <h3 style={{ textAlign: 'left', marginTop: '0', paddingTop: '0' }}>Regulation Analysis:</h3>
                        <div style={{ 
                            whiteSpace: 'pre-wrap',
                            textAlign: 'justify',
                            textJustify: 'inter-word'
                        }}>
                            {analysis.regulation_analysis.split('\n').map((line, index) => {
                                if (line.match(/^\d+\.\s+[A-Za-z\s]+:$/) || line.match(/^[A-Za-z\s]+:$/)) {
                                    return <p key={index}><strong>{line}</strong></p>;
                                }
                                return <p key={index}>{line}</p>;
                            })}
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default GeneRegulation; 