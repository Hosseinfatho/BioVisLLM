import React, { useState, useEffect } from 'react';
import './MainView.css';
import { MultiSampleViewer } from './MultiSampleViewer.jsx';

interface Sample {
  id: string;
  name: string;
}

const MainView: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [samples] = useState<Sample[]>([
    { id: 'skin_TXK6Z4X_A1', name: 'Skin Sample A1' },
    { id: 'skin_TXK6Z4X_D1', name: 'Skin Sample D1' }
  ]);
  const [cellTypeCoordinatesData, setCellTypeCoordinatesData] = useState<any[]>([]);
  const [cellTypeDir, setCellTypeDir] = useState<Record<string, string[]>>({});
  const [regions, setRegions] = useState<any[]>([]);
  const [NMFGOData, setNMFGOData] = useState<Record<string, any>>({});
  const [NMFGODataLoading, setNMFGODataLoading] = useState(false);
  const [analyzedRegion, setAnalyzedRegion] = useState<string | null>(null);
  const [NMFclusterCells, setNMFclusterCells] = useState<any[]>([]);
  const [selectedRegionGeneExpressionData, setSelectedRegionGeneExpressionData] = useState<any>(null);

  // Load initial cell type data
  useEffect(() => {
    const loadCellTypeData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/get_cell_type_coordinates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sample_names: samples.map(s => s.id)
          })
        });
        const data = await response.json();
        setCellTypeCoordinatesData(data);
      } catch (error) {
        console.error('Error loading cell type data:', error);
      }
      setLoading(false);
    };

    loadCellTypeData();
  }, [samples]);

  return (
    <div className="main-view">
      <div className="topic-banner">Multi Sample Viewer</div>
      <div className="content">
        <MultiSampleViewer 
          setLoading={setLoading}
          samples={samples}
          cellTypeCoordinatesData={cellTypeCoordinatesData}
          cellTypeDir={cellTypeDir}
          regions={regions}
          setRegions={setRegions}
          setNMFGOData={setNMFGOData}
          setNMFGODataLoading={setNMFGODataLoading}
          analyzedRegion={analyzedRegion}
          setAnalyzedRegion={setAnalyzedRegion}
          NMFclusterCells={NMFclusterCells}
          setSelectedRegionGeneExpressionData={setSelectedRegionGeneExpressionData}
        />
      </div>
    </div>
  );
};

export default MainView; 