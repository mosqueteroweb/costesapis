import { useState, useEffect } from 'react';
import type { ApiResponse, Model, Provider } from './types';

export function useModelsData() {
  const [models, setModels] = useState<Model[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('https://models.dev/api.json');
        if (!response.ok) {
          throw new Error('Failed to fetch data from models.dev API');
        }
        const data: ApiResponse = await response.json();

        const allModels: Model[] = [];
        const allProviders: Provider[] = [];

        Object.entries(data).forEach(([providerId, provider]) => {
          if (!provider || typeof provider !== 'object') return;

          allProviders.push({ ...provider, id: providerId });

          if (provider.models && typeof provider.models === 'object') {
            Object.entries(provider.models).forEach(([modelId, modelData]) => {
              // Ensure we have the minimum required data to avoid crashes
              if (modelData &&
                  modelData.name &&
                  modelData.cost &&
                  typeof modelData.cost === 'object' &&
                  modelData.limit &&
                  typeof modelData.limit === 'object') {

                // Set default values for missing cost/limit fields to prevent NaN in calculations
                const safeCost = {
                  input: typeof modelData.cost.input === 'number' ? modelData.cost.input : 0,
                  output: typeof modelData.cost.output === 'number' ? modelData.cost.output : 0,
                  cache_read: typeof modelData.cost.cache_read === 'number' ? modelData.cost.cache_read : 0,
                  cache_write: typeof modelData.cost.cache_write === 'number' ? modelData.cost.cache_write : 0,
                };

                const safeLimit = {
                  context: typeof modelData.limit.context === 'number' ? modelData.limit.context : 0,
                  output: typeof modelData.limit.output === 'number' ? modelData.limit.output : 0,
                };

                allModels.push({
                  ...modelData,
                  id: modelId,
                  providerId,
                  providerName: provider.name || providerId,
                  cost: safeCost,
                  limit: safeLimit
                } as Model);
              }
            });
          }
        });

        setModels(allModels);
        setProviders(allProviders);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { models, providers, loading, error };
}
