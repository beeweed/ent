import { memo } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Bot, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { Message } from '../store/chatStore';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

export const ChatMessage = memo(function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <motion.div
      data-design-id={`chat-message-${message.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div data-design-id="assistant-avatar" className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff6b2c]/20 to-[#ff8f5a]/20 flex items-center justify-center border border-[#ff6b2c]/20">
          <Bot className="w-5 h-5 text-[#ff6b2c]" />
        </div>
      )}
      
      <div
        className={`relative max-w-[80%] md:max-w-[70%] ${
          isUser
            ? 'bg-gradient-to-br from-[#ff6b2c] to-[#ff8f5a] text-black rounded-2xl rounded-br-md px-4 py-3'
            : 'text-foreground'
        }`}
      >
        {isUser ? (
          <p data-design-id="user-message-content" className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div data-design-id="assistant-message-content" className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => (
                  <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
                ),
                code: ({ className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeString = String(children).replace(/\n$/, '');
                  
                  if (match) {
                    return (
                      <div className="relative group my-4">
                        <div className="flex items-center justify-between px-4 py-2 bg-black/40 rounded-t-xl border border-white/5 border-b-0">
                          <span className="text-xs text-muted-foreground font-mono">{match[1]}</span>
                          <button
                            onClick={() => copyCode(codeString)}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition-colors"
                          >
                            {copiedCode === codeString ? (
                              <>
                                <Check className="w-3 h-3" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="!mt-0 !rounded-t-none code-block p-4 overflow-x-auto rounded-b-xl">
                          <code className={`${className} text-sm`} {...props}>
                            {children}
                          </code>
                        </pre>
                      </div>
                    );
                  }
                  
                  return (
                    <code className="px-1.5 py-0.5 bg-white/10 rounded-md text-[#ff8f5a] font-mono text-sm" {...props}>
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => <>{children}</>,
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-1 mb-3">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-1 mb-3">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-sm leading-relaxed">{children}</li>
                ),
                h1: ({ children }) => (
                  <h1 className="text-xl font-bold mb-3 gradient-text">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-semibold mb-2 text-white">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-semibold mb-2 text-white">{children}</h3>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#ff6b2c] hover:underline"
                  >
                    {children}
                  </a>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-[#ff6b2c]/50 pl-4 italic text-muted-foreground my-3">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full border border-white/10 rounded-lg overflow-hidden">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="px-4 py-2 bg-white/5 text-left text-sm font-semibold border-b border-white/10">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-2 text-sm border-b border-white/5">{children}</td>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 bg-[#ff6b2c] animate-pulse rounded-sm" />
            )}
          </div>
        )}
      </div>
      
      {isUser && (
        <div data-design-id="user-avatar" className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </motion.div>
  );
});