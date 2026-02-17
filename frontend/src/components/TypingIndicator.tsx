import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <motion.div
      data-design-id="typing-indicator"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex gap-4"
    >
      <div data-design-id="typing-avatar" className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff6b2c]/20 to-[#ff8f5a]/20 flex items-center justify-center border border-[#ff6b2c]/20">
        <Bot className="w-5 h-5 text-[#ff6b2c]" />
      </div>
      
      <div data-design-id="typing-bubble" className="glass rounded-2xl px-5 py-3 border border-white/5">
        <div className="typing-indicator flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#ff6b2c]" />
          <span className="w-2 h-2 rounded-full bg-[#ff6b2c]" />
          <span className="w-2 h-2 rounded-full bg-[#ff6b2c]" />
        </div>
      </div>
    </motion.div>
  );
}