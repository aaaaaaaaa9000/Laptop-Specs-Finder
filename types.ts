
export interface Specification {
  name: string;
  value: string;
}

export interface DisplaySpecs {
  size?: string;
  resolution?: string;
  refreshRate?: string;
  panelType?: string;
  brightness?: string;
  colorGamut?: string;
  touch?: string;
}

export type Confidence = 'high' | 'medium' | 'low';

export interface Laptop {
  modelName: string;
  partNumber?: string;
  releaseYear?: string;
  cpu?: string;
  gpu?: string;
  ram?: string;
  storage?: string;
  display?: DisplaySpecs;
  battery?: string;
  weight?: string;
  ports?: string;
  webcam?: string;
  opticalDrive?: string;
  confidence: Confidence;
  extraSpecs?: Specification[];
}

export type MatchStatus = 'exact' | 'partial' | 'not_found';

export interface Source {
  title: string;
  uri: string;
}

export interface SpecsResponse {
  matchStatus: MatchStatus;
  suggestions: string[];
  laptops: Laptop[];
  sources: Source[];
  cached?: boolean;
}

export interface IdentifyResponse {
  found: boolean;
  brand?: string;
  modelName?: string;
  partNumber?: string;
  searchQuery: string;
}

export interface HistoryEntry {
  query: string;
  timestamp: number;
  result: SpecsResponse;
}
