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
          throw new Error('Failed to fetch data');
        }
        const data: ApiResponse = await response.json();

        const allModels: Model[] = [];
        const allProviders: Provider[] = [];

        Object.entries(data).forEach(([providerId, provider]) => {
          allProviders.push({ ...provider, id: providerId });
          Object.entries(provider.models).forEach(([, modelData]) => {
            allModels.push({
              ...modelData,
              providerId,
              providerName: provider.name
            } as Model);
          });
        });

        setModels(allModels);
        setProviders(allProviders);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { models, providers, loading, error };
}
