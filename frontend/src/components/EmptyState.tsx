import { motion } from 'framer-motion';
import { Zap, MessageSquare, Code, Lightbulb, Rocket } from 'lucide-react';
import { useChatStore } from '../store/chatStore';

const suggestions = [
  {
    icon: Code,
    title: 'Write Code',
    prompt: 'Write a Python function to calculate fibonacci numbers',
  },
  {
    icon: Lightbulb,
    title: 'Explain Concepts',
    prompt: 'Explain quantum computing in simple terms',
  },
  {
    icon: MessageSquare,
    title: 'Creative Writing',
    prompt: 'Write a short story about a robot discovering emotions',
  },
  {
    icon: Rocket,
    title: 'Brainstorm Ideas',
    prompt: 'Give me 5 innovative app ideas for productivity',
  },
];

interface EmptyStateProps {
  onSuggestionClick: (prompt: string) => void;
}

export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  const { selectedModel, models, apiKey } = useChatStore();
  const selectedModelInfo = models.find((m) => m.id === selectedModel);

  return (
    <div data-design-id="empty-state" className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-2xl"
      >
        <motion.div
          data-design-id="empty-state-logo"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#ff6b2c] to-[#ff8f5a] flex items-center justify-center neon-glow-intense"
        >
          <Zap className="w-10 h-10 text-black" />
        </motion.div>
        
        <motion.h2
          data-design-id="empty-state-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-4xl font-bold mb-3"
        >
          <span className="gradient-text">Welcome to NEXUS</span>
        </motion.h2>
        
        <motion.p
          data-design-id="empty-state-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground mb-8"
        >
          {!apiKey 
            ? 'Add your OpenRouter API key in settings to begin'
            : selectedModelInfo 
            ? `Connected to ${selectedModelInfo.name}` 
            : 'Select a model to start chatting'}
        </motion.p>

        {selectedModelInfo && (
          <motion.div
            data-design-id="model-description-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-8 p-4 glass rounded-xl border border-white/5 text-left"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#ff6b2c]/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-[#ff6b2c]" />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">{selectedModelInfo.name}</h3>
                {selectedModelInfo.description && (
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {selectedModelInfo.description}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  {selectedModelInfo.context_length > 0 && (
                    <span>Context: {(selectedModelInfo.context_length / 1000).toFixed(0)}K</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {apiKey && selectedModel && (
          <motion.div
            data-design-id="suggestions-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={suggestion.title}
                data-design-id={`suggestion-${index}`}
                onClick={() => onSuggestionClick(suggestion.prompt)}
                className="flex items-center gap-3 p-4 glass rounded-xl border border-white/5 text-left hover:border-[#ff6b2c]/30 hover:bg-white/5 transition-all duration-300 group"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-10 h-10 rounded-lg bg-[#ff6b2c]/10 flex items-center justify-center group-hover:bg-[#ff6b2c]/20 transition-colors">
                  <suggestion.icon className="w-5 h-5 text-[#ff6b2c]" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">{suggestion.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">{suggestion.prompt}</p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}