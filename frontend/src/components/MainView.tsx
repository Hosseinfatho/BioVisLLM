import React, { useState, useEffect } from 'react';
import { Select, Button, message, Card } from 'antd';
import axios from 'axios';
import './MainView.css';

const MainView: React.FC = () => {
  const [samples, setSamples] = useState<string[]>([]);
  const [selectedSample, setSelectedSample] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Fetch available samples from backend
    const fetchSamples = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/samples');
        setSamples(response.data);
      } catch (error) {
        message.error('Failed to fetch samples');
      }
    };
    fetchSamples();
  }, []);

  const handleSampleSelect = async (value: string) => {
    setSelectedSample(value);
    try {
      const response = await axios.get(`http://localhost:3000/api/samples/${value}/image`);
      setImageUrl(response.data.imageUrl);
    } catch (error) {
      message.error('Failed to load image');
    }
  };

  const handleCellSelect = (value: string[]) => {
    setSelectedCells(value);
  };

  const handleGeneExpression = async () => {
    if (!selectedSample || selectedCells.length === 0) {
      message.warning('Please select a sample and cells first');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:3000/api/analyze', {
        sampleId: selectedSample,
        cells: selectedCells
      });
      message.success('Analysis completed successfully');
    } catch (error) {
      message.error('Failed to analyze gene expression');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container">
      <div className="control-panels">
        <Card className="left-panel" title="Cell & Gene Analysis">
          <div className="control-group">
            <Select
              style={{ width: '100%', marginBottom: '16px' }}
              placeholder="Select Cell Type"
              onChange={handleCellSelect}
              mode="multiple"
              options={[
                { value: 'cell1', label: 'Cell Type 1' },
                { value: 'cell2', label: 'Cell Type 2' },
                { value: 'cell3', label: 'Cell Type 3' }
              ]}
            />
            <Select
              style={{ width: '100%', marginBottom: '16px' }}
              placeholder="Select Gene"
              options={[
                { value: 'gene1', label: 'Gene 1' },
                { value: 'gene2', label: 'Gene 2' },
                { value: 'gene3', label: 'Gene 3' }
              ]}
            />
            <Button type="primary" onClick={handleGeneExpression} loading={loading}>
              Analyze Gene Expression
            </Button>
          </div>
        </Card>

        <Card className="right-panel" title="Region Selection">
          <div className="control-group">
            <Select
              style={{ width: '100%', marginBottom: '16px' }}
              placeholder="Select Sample"
              onChange={handleSampleSelect}
              options={samples.map(sample => ({ value: sample, label: sample }))}
            />
            <Select
              style={{ width: '100%' }}
              placeholder="Select Region"
              options={[
                { value: 'region1', label: 'Region 1' },
                { value: 'region2', label: 'Region 2' },
                { value: 'region3', label: 'Region 3' }
              ]}
            />
          </div>
        </Card>
      </div>

      <div className="image-container">
        {imageUrl ? (
          <img src={imageUrl} alt="Sample" style={{ maxWidth: '100%', maxHeight: '100%' }} />
        ) : (
          <div className="placeholder">Select a sample to view image</div>
        )}
      </div>
    </div>
  );
};

export default MainView; 