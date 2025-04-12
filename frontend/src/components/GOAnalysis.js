import React, { useState, useEffect } from 'react';
import { Card, Spin, message, Typography, Popover } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import ComponentBanner from './ComponentBanner';

const { Text } = Typography;

const GOAnalysis = ({ selectedCells, selectedGenes }) => {
    const [analysis, setAnalysis] = useState({
        selected_cells: ['Keratinocyte', 'Fibroblast', 'Melanocyte'],
        selected_genes: ['COL1A1', 'KRT14', 'TYR'],
        go_analysis: `Based on the selected cell types (Keratinocyte, Fibroblast, Melanocyte) and genes (COL1A1, KRT14, TYR), the Gene Ontology analysis reveals significant biological processes and molecular functions:

1. Biological Processes:
- Epidermis development (GO:0008544)
- Skin development (GO:0043588)
- Collagen fibril organization (GO:0030199)
- Melanin biosynthetic process (GO:0042438)

2. Molecular Functions:
- Structural constituent of cytoskeleton (GO:0005200)
- Extracellular matrix structural constituent (GO:0005201)
- Tyrosinase activity (GO:0004503)

3. Cellular Components:
- Intermediate filament (GO:0005882)
- Extracellular matrix (GO:0031012)
- Melanosome (GO:0042470)

These GO terms indicate that the selected cells and genes are primarily involved in skin tissue structure and pigmentation. The analysis suggests strong involvement in extracellular matrix organization, cytoskeletal structure, and melanin production pathways.`
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log('Selected Cells:', selectedCells);
        console.log('Selected Genes:', selectedGenes);

        const fetchGOAnalysis = async () => {
            // Get top 3 cells and genes from the selections
            const topCells = selectedCells.slice(0, 3);
            const topGenes = selectedGenes.slice(0, 3);

            console.log('Top 3 Cells:', topCells);
            console.log('Top 3 Genes:', topGenes);

            if (topCells.length > 0 && topGenes.length > 0) {
                setLoading(true);
                try {
                    const response = await fetch('http://localhost:5003/generate_go_analysis', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            selected_cells: topCells,
                            selected_genes: topGenes
                        })
                    });

                    const data = await response.json();
                    if (data.error) {
                        message.error(data.error);
                    } else {
                        setAnalysis(data);
                    }
                } catch (error) {
                    message.error('Failed to fetch GO analysis');
                    console.error('Error:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchGOAnalysis();
    }, [selectedCells, selectedGenes]);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <ComponentBanner title="GO Analysis" />
                <Popover 
                    content={
                        <div style={{ maxWidth: '300px' }}>
                            <p>GO Analysis is the process of identifying enriched Gene Ontology terms to understand the biological functions, processes, and cellular components associated with a set of genes.</p>
                        </div>
                    }
                    title="What is GO Analysis?"
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
                    <div style={{ textAlign: 'left' }}>
                        <h3 style={{ textAlign: 'left', marginTop: '0', paddingTop: '0' }}>GO Analysis:</h3>
                        <div style={{ 
                            whiteSpace: 'pre-wrap',
                            textAlign: 'justify',
                            textJustify: 'inter-word'
                        }}>
                            {analysis.go_analysis.split('\n').map((line, index) => {
                                if (line.match(/^\d+\.\s+[A-Za-z\s]+:$/)) {
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

export default GOAnalysis; 