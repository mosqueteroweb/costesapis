import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  BarChart3,
  Zap,
  ChevronRight,
  Info,
  Cpu,
  Globe,
  TrendingUp,
  Box,
  LayoutGrid,
  Scale
} from 'lucide-react';
import { useModelsData } from './useModelsData';
import type { Model } from './types';

function App() {
  const { models, providers, loading, error } = useModelsData();

  // Navigation
  const [activeTab, setActiveTab] = useState<'explorer' | 'comparison' | 'analytics'>('explorer');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [showPre2025, setShowPre2025] = useState(false);
  const [capabilities, setCapabilities] = useState({
    reasoning: false,
    tool_call: false,
    attachment: false,
    open_weights: false
  });
  const [minContext, setMinContext] = useState(0);

  // Calculator State
  const [inputTokens, setInputTokens] = useState(100000); // Default 100k
  const [outputTokens, setOutputTokens] = useState(10000);  // Default 10k

  // Selection
  const [selectedModelsForComparison, setSelectedModelsForComparison] = useState<string[]>([]);
  const [selectedModelDetails, setSelectedModelDetails] = useState<Model | null>(null);

  // Sorting
  const [sortBy, setSortBy] = useState<'name' | 'releaseDate' | 'context' | 'cost'>('releaseDate');

  const filteredModels = useMemo(() => {
    return models.filter(model => {
      // Search
      const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           model.providerName.toLowerCase().includes(searchQuery.toLowerCase());

      // Providers
      const matchesProvider = selectedProviders.length === 0 || selectedProviders.includes(model.providerId);

      // Pre-2025 Toggle
      const isPre2025 = new Date(model.release_date) < new Date('2025-01-01');
      const matchesDate = showPre2025 || !isPre2025;

      // Capabilities
      const matchesReasoning = !capabilities.reasoning || model.reasoning;
      const matchesToolCall = !capabilities.tool_call || model.tool_call;
      const matchesAttachment = !capabilities.attachment || model.attachment;
      const matchesOpenWeights = !capabilities.open_weights || model.open_weights;

      // Context
      const matchesContext = model.limit.context >= minContext;

      return matchesSearch && matchesProvider && matchesDate &&
             matchesReasoning && matchesToolCall && matchesAttachment &&
             matchesOpenWeights && matchesContext;
    }).sort((a, b) => {
      if (sortBy === 'releaseDate') {
        return new Date(b.release_date).getTime() - new Date(a.release_date).getTime();
      }
      if (sortBy === 'context') {
        return b.limit.context - a.limit.context;
      }
      if (sortBy === 'cost') {
        const costA = (a.cost.input * inputTokens + a.cost.output * outputTokens) / 1000000;
        const costB = (b.cost.input * inputTokens + b.cost.output * outputTokens) / 1000000;
        return costA - costB;
      }
      return a.name.localeCompare(b.name);
    });
  }, [models, searchQuery, selectedProviders, showPre2025, capabilities, minContext, sortBy, inputTokens, outputTokens]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-text-secondary animate-pulse">Loading intelligence models...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="glass p-8 rounded-2xl max-w-md text-center">
          <Info className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Failed to load data</h2>
          <p className="text-text-secondary mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary font-['Inter']">
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-white/5 px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Cpu className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Models.dev <span className="text-primary">Explorer</span></h1>
              <p className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold">Live Cost & Performance Matrix</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center bg-black/20 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab('explorer')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'explorer' ? 'bg-white/10 text-white shadow-sm' : 'text-text-secondary hover:text-white'}`}
            >
              <LayoutGrid size={16} /> Explorer
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'comparison' ? 'bg-white/10 text-white shadow-sm' : 'text-text-secondary hover:text-white'}`}
            >
              <Scale size={16} /> Comparison
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'analytics' ? 'bg-white/10 text-white shadow-sm' : 'text-text-secondary hover:text-white'}`}
            >
              <BarChart3 size={16} /> Analytics
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-[10px] text-text-secondary uppercase font-bold">Total Models</span>
              <span className="text-sm font-mono font-bold text-secondary">{models.length}</span>
            </div>
            <div className="w-px h-8 bg-white/10 hidden lg:block"></div>
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] text-emerald-500 font-bold uppercase">API Live</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-80 flex-shrink-0 space-y-6">
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search models or providers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card/50 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>

          {/* Cost Simulator */}
          <div className="glass-card p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={18} className="text-secondary" />
              <h3 className="font-bold text-sm uppercase tracking-wider">Cost Simulator</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs text-text-secondary font-medium">Input Tokens</label>
                  <span className="text-xs font-mono text-secondary">{inputTokens.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="1000000"
                  step="1000"
                  value={inputTokens}
                  onChange={(e) => setInputTokens(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs text-text-secondary font-medium">Output Tokens</label>
                  <span className="text-xs font-mono text-secondary">{outputTokens.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="100000"
                  step="100"
                  value={outputTokens}
                  onChange={(e) => setOutputTokens(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-secondary"
                />
              </div>
              <div className="pt-2 text-[10px] text-text-secondary leading-relaxed italic">
                * Prices calculated per { (inputTokens + outputTokens).toLocaleString() } tokens total.
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="glass-card p-5 rounded-2xl space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-4 flex items-center gap-2">
                <Filter size={14} /> Global Filters
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-10 h-5 rounded-full transition-all relative ${showPre2025 ? 'bg-primary' : 'bg-white/10'}`}>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={showPre2025}
                      onChange={(e) => setShowPre2025(e.target.checked)}
                    />
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${showPre2025 ? 'left-6' : 'left-1'}`}></div>
                  </div>
                  <span className="text-sm font-medium group-hover:text-white transition-colors">Show Pre-2025</span>
                </label>
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-text-secondary/50 mb-3">Min Context Window</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[10px] font-mono text-text-secondary">0</span>
                  <span className="text-[10px] font-mono text-primary">{(minContext/1024).toFixed(0)}K</span>
                  <span className="text-[10px] font-mono text-text-secondary">2M+</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2000000"
                  step="16384"
                  value={minContext}
                  onChange={(e) => setMinContext(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-text-secondary/50 mb-3">Capabilities</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(capabilities).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setCapabilities(prev => ({ ...prev, [key]: !value }))}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${value ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/5 text-text-secondary hover:border-white/20'}`}
                  >
                    {key.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-text-secondary/50 mb-3">Providers</h4>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {providers.sort((a,b) => a.name.localeCompare(b.name)).map(provider => (
                  <label key={provider.id} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="rounded border-white/10 bg-white/5 text-primary focus:ring-primary/50"
                      checked={selectedProviders.includes(provider.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProviders([...selectedProviders, provider.id]);
                        } else {
                          setSelectedProviders(selectedProviders.filter(id => id !== provider.id));
                        }
                      }}
                    />
                    <span className="text-sm text-text-secondary group-hover:text-white transition-colors">{provider.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Main area would be populated by tabs */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              {activeTab === 'explorer' && <><LayoutGrid className="text-primary" /> Model Explorer</>}
              {activeTab === 'comparison' && <><Scale className="text-primary" /> Comparison Matrix</>}
              {activeTab === 'analytics' && <><BarChart3 className="text-primary" /> Market Analytics</>}
              <span className="text-sm font-medium text-text-secondary bg-white/5 px-3 py-1 rounded-full">
                {filteredModels.length} Results
              </span>
            </h2>

            <div className="flex items-center gap-3">
              <span className="text-xs text-text-secondary font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-card border border-white/10 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-primary/50"
              >
                <option value="releaseDate">Latest Release</option>
                <option value="cost">Estimated Cost</option>
                <option value="context">Context Window</option>
                <option value="name">Model Name</option>
              </select>
            </div>
          </div>

          {activeTab === 'explorer' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredModels.map(model => (
                <div key={model.id} className="glass-card rounded-2xl p-5 flex flex-col group h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                        <img
                          src={`https://models.dev/logos/${model.providerId}.svg`}
                          alt={model.providerName}
                          className="w-6 h-6 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://www.svgrepo.com/show/354148/openai-icon.svg';
                          }}
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm leading-tight group-hover:text-primary transition-colors">{model.name}</h4>
                        <p className="text-[11px] text-text-secondary">{model.providerName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-text-secondary uppercase font-bold tracking-tighter">Est. Cost</p>
                      <p className="text-lg font-mono font-bold text-emerald-500">
                        ${((model.cost.input * inputTokens + model.cost.output * outputTokens) / 1000000).toFixed(4)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {model.reasoning && <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 text-[10px] font-bold border border-purple-500/20">REASONING</span>}
                    {model.tool_call && <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20">TOOLS</span>}
                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-text-secondary text-[10px] font-bold border border-white/5">
                      {Math.round(model.limit.context / 1024)}K CTX
                    </span>
                  </div>

                  <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedModelDetails(model)}
                      className="text-xs font-bold text-text-secondary hover:text-white flex items-center gap-1 transition-colors"
                    >
                      Details <ChevronRight size={14} />
                    </button>
                    <button
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedModelsForComparison.includes(model.id) ? 'bg-secondary text-white' : 'bg-white/5 hover:bg-white/10 text-white'}`}
                      onClick={() => {
                        if (selectedModelsForComparison.includes(model.id)) {
                          setSelectedModelsForComparison(selectedModelsForComparison.filter(id => id !== model.id));
                        } else {
                          setSelectedModelsForComparison([...selectedModelsForComparison, model.id]);
                        }
                      }}
                    >
                      {selectedModelsForComparison.includes(model.id) ? 'Selected' : 'Compare'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-12">
              <div>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <TrendingUp className="text-emerald-500" /> Top 10 Models by Input Cost ($ per 1M)
                </h3>
                <div className="glass-card rounded-3xl p-8 space-y-4">
                  {[...filteredModels]
                    .sort((a, b) => a.cost.input - b.cost.input)
                    .slice(0, 10)
                    .map((model) => {
                      const maxCost = Math.max(...filteredModels.map(m => m.cost.input));
                      const width = (model.cost.input / maxCost) * 100;
                      return (
                        <div key={model.id} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span>{model.name}</span>
                            <span className="font-mono text-emerald-500">${model.cost.input.toFixed(2)}</span>
                          </div>
                          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000"
                              style={{ width: `${Math.max(width, 1)}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Box className="text-primary" /> Context Efficiency (Tokens per Dollar)
                </h3>
                <div className="glass-card rounded-3xl p-8 space-y-4">
                  {[...filteredModels]
                    .filter(m => m.cost.input > 0)
                    .sort((a, b) => (b.limit.context / (b.cost.input || 0.01)) - (a.limit.context / (a.cost.input || 0.01)))
                    .slice(0, 10)
                    .map((model) => {
                      const efficiency = model.limit.context / (model.cost.input || 0.01);
                      const maxEfficiency = Math.max(...filteredModels.map(m => m.limit.context / (m.cost.input || 0.01)));
                      const width = (efficiency / maxEfficiency) * 100;
                      return (
                        <div key={model.id} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span>{model.name}</span>
                            <span className="font-mono text-primary">{(efficiency/1000).toFixed(0)}K tokens/$</span>
                          </div>
                          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000"
                              style={{ width: `${Math.max(width, 1)}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comparison' && (
            <div className="overflow-x-auto">
              {selectedModelsForComparison.length === 0 ? (
                <div className="glass-card rounded-3xl p-12 text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Scale className="text-text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No models selected</h3>
                  <p className="text-text-secondary max-w-sm mx-auto">Go back to the explorer and select models to compare them side-by-side.</p>
                  <button
                    onClick={() => setActiveTab('explorer')}
                    className="mt-6 px-6 py-2 bg-primary rounded-xl font-bold hover:opacity-90 transition-opacity"
                  >
                    Go to Explorer
                  </button>
                </div>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="p-4 text-left border-b border-white/5 bg-black/20 rounded-tl-2xl">Spec</th>
                      {selectedModelsForComparison.map(id => {
                        const model = models.find(m => m.id === id);
                        return (
                          <th key={id} className="p-4 text-left border-b border-white/5 bg-black/20 min-w-[240px]">
                            <div className="flex items-center gap-2">
                              <img src={`https://models.dev/logos/${model?.providerId}.svg`} className="w-5 h-5" alt="" />
                              <span className="truncate">{model?.name}</span>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr>
                      <td className="p-4 border-b border-white/5 font-bold text-text-secondary">Provider</td>
                      {selectedModelsForComparison.map(id => (
                        <td key={id} className="p-4 border-b border-white/5">{models.find(m => m.id === id)?.providerName}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-white/5 font-bold text-text-secondary">Release Date</td>
                      {selectedModelsForComparison.map(id => (
                        <td key={id} className="p-4 border-b border-white/5">{models.find(m => m.id === id)?.release_date}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-white/5 font-bold text-text-secondary">Context Window</td>
                      {selectedModelsForComparison.map(id => (
                        <td key={id} className="p-4 border-b border-white/5 font-mono">{(models.find(m => m.id === id)?.limit.context || 0).toLocaleString()}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-white/5 font-bold text-text-secondary">Input Cost / 1M</td>
                      {selectedModelsForComparison.map(id => (
                        <td key={id} className="p-4 border-b border-white/5 text-emerald-500 font-mono">${models.find(m => m.id === id)?.cost.input.toFixed(2)}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-white/5 font-bold text-text-secondary">Output Cost / 1M</td>
                      {selectedModelsForComparison.map(id => (
                        <td key={id} className="p-4 border-b border-white/5 text-emerald-500 font-mono">${models.find(m => m.id === id)?.cost.output.toFixed(2)}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-white/5 font-bold text-text-secondary">Reasoning</td>
                      {selectedModelsForComparison.map(id => (
                        <td key={id} className="p-4 border-b border-white/5">
                          {models.find(m => m.id === id)?.reasoning ?
                            <span className="text-purple-400 font-bold">YES</span> :
                            <span className="text-text-secondary/30">NO</span>
                          }
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-white/5 font-bold text-text-secondary">Tools</td>
                      {selectedModelsForComparison.map(id => (
                        <td key={id} className="p-4 border-b border-white/5">
                          {models.find(m => m.id === id)?.tool_call ?
                            <span className="text-blue-400 font-bold">YES</span> :
                            <span className="text-text-secondary/30">NO</span>
                          }
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-white/5 font-bold text-text-secondary">Simulated Cost</td>
                      {selectedModelsForComparison.map(id => {
                        const m = models.find(m => m.id === id);
                        const cost = m ? (m.cost.input * inputTokens + m.cost.output * outputTokens) / 1000000 : 0;
                        return (
                          <td key={id} className="p-4 border-b border-white/5 font-bold text-lg text-emerald-500 font-mono">
                            ${cost.toFixed(4)}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Model Detail Modal */}
      {selectedModelDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-2xl rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-secondary"></div>
            <button
              onClick={() => setSelectedModelDetails(null)}
              className="absolute top-6 right-6 text-text-secondary hover:text-white transition-colors"
            >
              ✕
            </button>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                <img
                  src={`https://models.dev/logos/${selectedModelDetails.providerId}.svg`}
                  alt={selectedModelDetails.providerName}
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{selectedModelDetails.name}</h3>
                <p className="text-text-secondary">Released: {new Date(selectedModelDetails.release_date).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] text-text-secondary uppercase font-bold mb-1">Context</p>
                <p className="text-lg font-mono font-bold">{(selectedModelDetails.limit.context/1024).toFixed(0)}K</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] text-text-secondary uppercase font-bold mb-1">Input</p>
                <p className="text-lg font-mono font-bold text-emerald-500">${selectedModelDetails.cost.input}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] text-text-secondary uppercase font-bold mb-1">Output</p>
                <p className="text-lg font-mono font-bold text-emerald-500">${selectedModelDetails.cost.output}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] text-text-secondary uppercase font-bold mb-1">Open Weights</p>
                <p className="text-lg font-bold">{selectedModelDetails.open_weights ? 'Yes' : 'No'}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Globe size={16} className="text-primary" /> SDK Integration
                </h4>
                <div className="bg-black/40 p-4 rounded-xl font-mono text-xs text-blue-300 border border-white/5 overflow-x-auto whitespace-pre">
                  <code>{`import { createOpenAI } from '@ai-sdk/openai';\n\nconst provider = createOpenAI({\n  baseURL: '${providers.find(p => p.id === selectedModelDetails.providerId)?.api}',\n  apiKey: process.env.${providers.find(p => p.id === selectedModelDetails.providerId)?.env?.[0] || 'API_KEY'},\n});\n\nconst model = provider('${selectedModelDetails.id}');`}</code>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider mb-3">Model Capabilities</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(selectedModelDetails).map(([key, value]) => {
                    if (typeof value === 'boolean' && value) {
                      return (
                        <span key={key} className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-bold uppercase">
                          {key.replace('_', ' ')}
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <a
                  href={providers.find(p => p.id === selectedModelDetails.providerId)?.doc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold text-secondary hover:underline"
                >
                  View Provider Documentation <ChevronRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
