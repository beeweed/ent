import { useState, useEffect } from 'react';
import { X, Key, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../store/chatStore';
import { fetchModels } from '../services/api';
import { Input } from './ui/input';
import { Button } from './ui/button';

export function SettingsModal() {
  const { apiKey, setApiKey, isSettingsOpen, setIsSettingsOpen, setModels } = useChatStore();
  const [inputKey, setInputKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setInputKey(apiKey);
  }, [apiKey, isSettingsOpen]);

  const handleSave = async () => {
    if (!inputKey.trim()) {
      setSaveStatus('error');
      setErrorMessage('API key is required');
      return;
    }

    setIsSaving(true);
    setSaveStatus('idle');
    setErrorMessage('');

    try {
      const data = await fetchModels(inputKey);
      setApiKey(inputKey);
      setModels(data.models || []);
      setSaveStatus('success');
      
      setTimeout(() => {
        setIsSettingsOpen(false);
        setSaveStatus('idle');
      }, 1000);
    } catch (error) {
      setSaveStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Invalid API key');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <motion.div
          data-design-id="settings-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsSettingsOpen(false)}
        >
          <motion.div
            data-design-id="settings-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-md glass rounded-2xl border border-white/10 overflow-hidden neon-glow"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff6b2c]/20 to-[#ff8f5a]/20 flex items-center justify-center">
                  <Key className="w-5 h-5 text-[#ff6b2c]" />
                </div>
                <div>
                  <h2 data-design-id="settings-title" className="text-lg font-semibold">Settings</h2>
                  <p data-design-id="settings-subtitle" className="text-xs text-muted-foreground">Configure your API access</p>
                </div>
              </div>
              <button
                data-design-id="settings-close-button"
                onClick={() => setIsSettingsOpen(false)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="space-y-2">
                <label data-design-id="api-key-label" className="text-sm font-medium text-muted-foreground">
                  OpenRouter API Key
                </label>
                <div className="relative">
                  <Input
                    data-design-id="api-key-input"
                    type={showKey ? 'text' : 'password'}
                    value={inputKey}
                    onChange={(e) => {
                      setInputKey(e.target.value);
                      setSaveStatus('idle');
                      setErrorMessage('');
                    }}
                    placeholder="sk-or-v1-..."
                    className="pr-10 bg-white/5 border-white/10 focus:border-[#ff6b2c]/50 font-mono text-sm"
                  />
                  <button
                    data-design-id="toggle-key-visibility"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p data-design-id="api-key-hint" className="text-xs text-muted-foreground">
                  Get your API key from{' '}
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#ff6b2c] hover:underline"
                  >
                    openrouter.ai/keys
                  </a>
                </p>
              </div>

              <AnimatePresence mode="wait">
                {saveStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                  >
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-red-400">{errorMessage}</span>
                  </motion.div>
                )}
                {saveStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20"
                  >
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400">API key saved successfully!</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                data-design-id="save-button"
                onClick={handleSave}
                disabled={isSaving || !inputKey.trim()}
                className="w-full bg-gradient-to-r from-[#ff6b2c] to-[#ff8f5a] text-black font-semibold hover:opacity-90 disabled:opacity-50 transition-all duration-300 neon-glow"
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Validating...
                  </div>
                ) : (
                  'Save & Connect'
                )}
              </Button>
            </div>

            <div className="p-4 border-t border-white/5 bg-white/[0.02]">
              <p data-design-id="settings-footer" className="text-xs text-center text-muted-foreground">
                Your API key is stored locally and never sent to our servers
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}