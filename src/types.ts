export interface ModelCost {
  input: number;
  output: number;
  cache_read?: number;
  cache_write?: number;
}

export interface ModelLimit {
  context: number;
  output?: number;
  input?: number;
}

export interface ModelModalities {
  input: string[];
  output: string[];
}

export interface Model {
  id: string;
  name: string;
  family?: string;
  attachment: boolean;
  reasoning: boolean;
  tool_call: boolean;
  temperature: boolean;
  knowledge?: string;
  release_date: string;
  last_updated: string;
  modalities: ModelModalities;
  open_weights: boolean;
  limit: ModelLimit;
  cost: ModelCost;
  providerId: string;
  providerName: string;
}

export interface Provider {
  id: string;
  name: string;
  api: string;
  doc: string;
  npm?: string;
  env?: string[];
  models: Record<string, Omit<Model, 'providerId' | 'providerName'>>;
}

export type ApiResponse = Record<string, Provider>;
