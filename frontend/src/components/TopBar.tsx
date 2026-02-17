import { useState, useEffect, useMemo, useCallback } from 'react';
import { Settings, ChevronDown, Search, Zap, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../store/chatStore';
import type { Model } from '../store/chatStore';
import { fetchModels } from '../services/api';
import { Input } from './ui/input';

export function TopBar() {
  const { 
    apiKey, 
    selectedModel, 
    models, 
    setSelectedModel, 
    setModels, 
    setIsSettingsOpen,
    searchQuery,
    setSearchQuery
  } = useChatStore();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  const loadModels = useCallback(async () => {
    if (!apiKey) return;
    
    setIsLoadingModels(true);
    try {
      const data = await fetchModels(apiKey);
      setModels(data.models || []);
      
      if (data.models?.length > 0 && !selectedModel) {
        const defaultModel = data.models.find((m: Model) => m.id.includes('gpt-4')) || data.models[0];
        setSelectedModel(defaultModel.id);
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
    } finally {
      setIsLoadingModels(false);
    }
  }, [apiKey, selectedModel, setModels, setSelectedModel]);

  useEffect(() => {
    if (apiKey) {
      loadModels();
    }
  }, [apiKey, loadModels]);

  const filteredModels = useMemo(() => {
    if (!searchQuery) return models;
    const query = searchQuery.toLowerCase();
    return models.filter(
      (model) =>
        model.id.toLowerCase().includes(query) ||
        model.name.toLowerCase().includes(query)
    );
  }, [models, searchQuery]);

  const selectedModelInfo = models.find((m) => m.id === selectedModel);

  return (
    <header 
      data-design-id="top-bar"
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5"
    >
      <div className="flex items-center justify-between px-4 md:px-6 h-16">
        <div data-design-id="top-bar-logo" className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff6b2c] to-[#ff8f5a] flex items-center justify-center neon-glow">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#ff6b2c] animate-pulse" />
          </motion.div>
          <div>
            <h1 data-design-id="top-bar-title" className="text-lg font-semibold gradient-text">NEXUS</h1>
            <p data-design-id="top-bar-subtitle" className="text-[10px] text-muted-foreground tracking-widest uppercase">AI Interface</p>
          </div>
        </div>

        <div data-design-id="top-bar-controls" className="flex items-center gap-3">
          <div className="relative">
            <motion.button
              data-design-id="model-selector-button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={!apiKey || isLoadingModels}
              className="flex items-center gap-2 px-4 py-2 rounded-xl glass glass-hover transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px] md:min-w-[280px]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoadingModels ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#ff6b2c]/30 border-t-[#ff6b2c] rounded-full animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading models...</span>
                </div>
              ) : selectedModelInfo ? (
                <>
                  <Sparkles className="w-4 h-4 text-[#ff6b2c]" />
                  <span className="text-sm truncate max-w-[150px] md:max-w-[200px]">
                    {selectedModelInfo.name}
                  </span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {apiKey ? 'Select a model' : 'Add API key first'}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 ml-auto transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </motion.button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  data-design-id="model-dropdown"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 mt-2 rounded-xl glass border border-white/10 overflow-hidden shadow-2xl"
                >
                  <div className="p-3 border-b border-white/5">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        data-design-id="model-search-input"
                        type="text"
                        placeholder="Search models..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-white/5 border-white/10 focus:border-[#ff6b2c]/50 text-sm"
                      />
                    </div>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {filteredModels.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground text-sm">
                        No models found
                      </div>
                    ) : (
                      filteredModels.map((model) => (
                        <motion.button
                          key={model.id}
                          data-design-id={`model-option-${model.id.replace(/[/:]/g, '-')}`}
                          onClick={() => {
                            setSelectedModel(model.id);
                            setIsDropdownOpen(false);
                            setSearchQuery('');
                          }}
                          className={`w-full p-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${
                            selectedModel === model.id ? 'bg-[#ff6b2c]/10' : ''
                          }`}
                          whileHover={{ x: 4 }}
                        >
                          <div className="flex items-center gap-2">
                            <Sparkles className={`w-3 h-3 ${selectedModel === model.id ? 'text-[#ff6b2c]' : 'text-muted-foreground'}`} />
                            <span className="text-sm font-medium truncate">{model.name}</span>
                          </div>
                          {model.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 ml-5">
                              {model.description}
                            </p>
                          )}
                        </motion.button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            data-design-id="settings-button"
            onClick={() => setIsSettingsOpen(true)}
            className="p-3 rounded-xl glass glass-hover transition-all duration-300 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings className="w-5 h-5 text-muted-foreground group-hover:text-[#ff6b2c] transition-colors group-hover:rotate-90 duration-300" />
          </motion.button>
        </div>
      </div>
      
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-[-1]" 
          onClick={() => {
            setIsDropdownOpen(false);
            setSearchQuery('');
          }} 
        />
      )}
    </header>
  );
}