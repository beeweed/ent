import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useChatStore } from '../store/chatStore';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { apiKey, selectedModel } = useChatStore();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isDisabled = disabled || !apiKey || !selectedModel;
  const placeholderText = !apiKey 
    ? 'Add your API key to start chatting...' 
    : !selectedModel 
    ? 'Select a model to start...' 
    : 'Type your message...';

  return (
    <div data-design-id="chat-input-container" className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          data-design-id="chat-input-wrapper"
          className="relative glass rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 focus-within:border-[#ff6b2c]/30 focus-within:neon-glow"
          whileHover={{ scale: isDisabled ? 1 : 1.005 }}
        >
          <div className="flex items-end gap-2 p-3">
            <div className="flex-shrink-0 p-2">
              <Sparkles className="w-5 h-5 text-[#ff6b2c]/50" />
            </div>
            
            <textarea
              ref={textareaRef}
              data-design-id="chat-input-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholderText}
              disabled={isDisabled}
              rows={1}
              className="flex-1 bg-transparent border-0 outline-none resize-none text-sm md:text-base placeholder:text-muted-foreground disabled:cursor-not-allowed min-h-[24px] max-h-[200px] py-2"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            />
            
            <motion.button
              data-design-id="chat-send-button"
              onClick={handleSubmit}
              disabled={isDisabled || !input.trim()}
              className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-[#ff6b2c] to-[#ff8f5a] text-black disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
              whileHover={{ scale: isDisabled || !input.trim() ? 1 : 1.05 }}
              whileTap={{ scale: isDisabled || !input.trim() ? 1 : 0.95 }}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
        
        <p data-design-id="chat-input-hint" className="text-xs text-center text-muted-foreground mt-3">
          Press <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[10px] font-mono">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[10px] font-mono">Shift + Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
}