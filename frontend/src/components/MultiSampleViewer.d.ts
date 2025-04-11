interface Sample {
  id: string;
  name: string;
}

interface CellTypeDir {
  [key: string]: string[];
}

interface CellTypeCoordinatesData {
  [key: string]: any;
}

export interface MultiSampleViewerProps {
  setLoading: (loading: boolean) => void;
  samples: Sample[];
  cellTypeCoordinatesData: CellTypeCoordinatesData;
  cellTypeDir: CellTypeDir;
  regions: any[];
  setRegions: (regions: any[]) => void;
  setNMFGOData: (data: any) => void;
  setNMFGODataLoading: (loading: boolean) => void;
  analyzedRegion: string | null;
  setAnalyzedRegion: (region: string | null) => void;
  NMFclusterCells: any[];
  setSelectedRegionGeneExpressionData: (data: any) => void;
}

export const MultiSampleViewer: React.FC<MultiSampleViewerProps>; 