import { useEffect, useState } from 'react';
import { Select, Spin, message, Button, Splitter } from 'antd';
import './App.css';
import { MultiSampleViewer } from './components/MultiSampleViewer';
import Banner from './components/Banner';
import SpatialComparison from './components/SpatialComparison';
import RegionalGeneCellRelationship from './components/RegionalGeneCellRelationship';
import DiseaseImmuneRelevance from './components/DiseaseImmuneRelevance';
import GeneCoexpressionInteraction from './components/GeneCoexpressionInteraction';
import ModelSelector from './components/ModelSelector';
import PathwayEnrichment from './components/PathwayEnrichment';

function App() {
  const [selectedModel, setSelectedModel] = useState('biobert');
  const [cellTypeCoordinatesData, setCellTypeCoordinatesData] = useState({});
  const [selectOptions, setSelectOptions] = useState([]);
  const [samples, setSamples] = useState([]); // [{id: 'sample_id', name: 'sample_id'}, ...]
  const [selectedSamples, setSelectedSamples] = useState([]);
  const [cellTypeDir, setCellTypeDir] = useState({});
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzedRegion, setAnalyzedRegion] = useState(null);
  const [NMFGOData, setNMFGOData] = useState({});
  const [NMFGODataLoading, setNMFGODataLoading] = useState(false);
  const [NMFclusterCells, setNMFclusterCells] = useState([]);
  const [selectedRegionGeneExpressionData, setSelectedRegionGeneExpressionData] = useState({});
  const [selectedCells, setSelectedCells] = useState([]);
  const [selectedGenes, setSelectedGenes] = useState([]);

  console.log('App - selectedCells:', selectedCells);
  console.log('App - selectedGenes:', selectedGenes);

  // get all aviailable samples
  const fetchAvailableSamples = () => {
    fetch('/get_available_samples')
      .then(response => response.json())
      .then(data => {
        setSelectOptions(data);
      })
      .catch(error => {
        message.error('Get samples failed');
        console.error(error);
      });
  };

  // get cell information(cell_type, cell_x, cell_y, id) for selected samples
  const fetchCellTypeData = (sampleIds) => {
    setLoading(true);
    fetch('/get_cell_type_coordinates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sample_ids: sampleIds })
    })
      .then(res => res.json())
      .then(data => {
        setCellTypeCoordinatesData(data);
        setLoading(false);
      })
  };

  // get cell type directory for each selected sample
  const fetchCellTypeDirectory = (sampleIds) => {
    fetch('/get_unique_cell_types', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sample_ids: sampleIds })
    })
      .then(res => res.json())
      .then(data => {
        setCellTypeDir(data);
      }).catch(error => {
        message.error('Get cell type directory failed');
        console.error(error);
      });
  };

  // confirm selected samples
  const confirmSamples = () => {
    if (selectedSamples.length === 0) {
      message.warning('Please select at least one sample');
    } else {
      fetchCellTypeData(selectedSamples);
      fetchCellTypeDirectory(selectedSamples);
      setSamples(selectedSamples.map(sample => ({ id: sample, name: sample })));
    }
  };

  // initial loading (get all available sample list)
  useEffect(() => {
    fetchAvailableSamples();
  }, []);

  const handleModelChange = (model) => {
    setSelectedModel(model);
    if (model === 'gpt') {
      message.info('GPT model will be available in future updates');
    }
  };

  return (
    <div className="App">
      <Banner />
      <ModelSelector onModelChange={handleModelChange} />
      <div className='main'>
        {/* select samples */}
        <div className="selectSamples">
          <Select
            size='small'
            mode="multiple"
            placeholder="Select samples"
            value={selectedSamples}
            onChange={setSelectedSamples}
            options={selectOptions}
            style={{ width: '100%', margin: 8 }}
            maxTagCount="responsive"
            loading={loading}
          />
          <Button size='small' onClick={confirmSamples}>Confirm</Button>
        </div>

        {/* all views */}
        <div className="content" style={{ position: "relative", height: "calc(100vh - 100px)" }}>
          {loading && (
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              background: "rgba(0, 0, 0, 0.5)",
              zIndex: 20
            }}>
              <Spin spinning={true} size="large" />
            </div>
          )}

          {samples.length > 0 ? (
            <Splitter lazy layout='vertical' style={{ width: "100%", height: "100%" }}>
              <Splitter.Panel defaultSize="70%" min="50%" max="80%">
                <Splitter lazy style={{ width: "100%", height: "100%" }}>
                  <Splitter.Panel defaultSize="66%" min="50%" max="80%">
                    <MultiSampleViewer
                      setLoading={setLoading}
                      samples={samples}
                      cellTypeCoordinatesData={cellTypeCoordinatesData}
                      cellTypeDir={cellTypeDir}
                      regions={regions}
                      setRegions={setRegions}
                      analyzedRegion={analyzedRegion}
                      setAnalyzedRegion={setAnalyzedRegion}
                      setNMFGOData={setNMFGOData}
                      setNMFGODataLoading={setNMFGODataLoading}
                      NMFclusterCells={NMFclusterCells}
                      setSelectedRegionGeneExpressionData={setSelectedRegionGeneExpressionData}
                      onCellSelect={setSelectedCells}
                      onGeneSelect={setSelectedGenes}
                    />
                  </Splitter.Panel>
                  <Splitter.Panel defaultSize="34%" min="20%" max="50%">
                    <Splitter lazy layout='vertical' style={{ height: "100%" }}>
                      <Splitter.Panel defaultSize="33.33%" min="20%" max="45%">
                        <RegionalGeneCellRelationship 
                          selectedCells={selectedCells}
                          selectedGenes={selectedGenes}
                          selectedModel={selectedModel}
                        />
                      </Splitter.Panel>
                      <Splitter.Panel defaultSize="33.33%" min="20%" max="45%">
                        <SpatialComparison 
                          selectedCells={selectedCells}
                          selectedGenes={selectedGenes}
                          selectedModel={selectedModel}
                        />
                      </Splitter.Panel>
                      <Splitter.Panel defaultSize="33.33%" min="20%" max="45%">
                        <PathwayEnrichment 
                          selectedCells={selectedCells}
                          selectedGenes={selectedGenes}
                          selectedModel={selectedModel}
                        />
                      </Splitter.Panel>
                    </Splitter>
                  </Splitter.Panel>
                </Splitter>
              </Splitter.Panel>
              <Splitter.Panel defaultSize="30%" min="20%" max="50%">
                <Splitter lazy style={{ width: "100%", height: "100%" }}>
                  <Splitter.Panel defaultSize="50%" min="30%" max="70%">
                    <DiseaseImmuneRelevance 
                      selectedCells={selectedCells}
                      selectedGenes={selectedGenes}
                      selectedModel={selectedModel}
                    />
                  </Splitter.Panel>
                  <Splitter.Panel defaultSize="50%" min="30%" max="70%">
                    <GeneCoexpressionInteraction 
                      selectedCells={selectedCells}
                      selectedGenes={selectedGenes}
                      selectedModel={selectedModel}
                    />
                  </Splitter.Panel>
                </Splitter>
              </Splitter.Panel>
            </Splitter>
          ) : (
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              width: "100%",
              color: "#999"
            }}>
              Please select at least one sample to view
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;