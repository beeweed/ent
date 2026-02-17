import { useRef, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useChatStore } from '../store/chatStore';
import { streamChat } from '../services/api';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { EmptyState } from './EmptyState';
import { ScrollArea } from './ui/scroll-area';

export function ChatArea() {
  const {
    apiKey,
    selectedModel,
    messages,
    isLoading,
    addMessage,
    updateLastMessage,
    setIsLoading,
  } = useChatStore();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!apiKey || !selectedModel || isLoading) return;

    addMessage({ role: 'user', content });
    setIsLoading(true);
    
    addMessage({ role: 'assistant', content: '' });
    
    const currentMessages = useChatStore.getState().messages;
    setStreamingMessageId(currentMessages[currentMessages.length - 1]?.id || null);

    try {
      const messagesToSend = currentMessages
        .slice(0, -1)
        .map((m) => ({ role: m.role, content: m.content }));

      let fullResponse = '';
      
      for await (const chunk of streamChat(apiKey, selectedModel, messagesToSend)) {
        fullResponse += chunk;
        updateLastMessage(fullResponse);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Chat error:', error);
      updateLastMessage(
        `Error: ${error instanceof Error ? error.message : 'Failed to get response. Please check your API key and try again.'}`
      );
    } finally {
      setIsLoading(false);
      setStreamingMessageId(null);
    }
  };

  return (
    <div data-design-id="chat-area" className="flex flex-col h-full pt-16">
      {messages.length === 0 ? (
        <EmptyState onSuggestionClick={handleSendMessage} />
      ) : (
        <ScrollArea ref={scrollRef} data-design-id="messages-container" className="flex-1">
          <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isStreaming={isLoading && message.id === streamingMessageId}
                />
              ))}
              {isLoading && !streamingMessageId && (
                <TypingIndicator key="typing" />
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      )}
      
      <ChatInput onSend={handleSendMessage} disabled={isLoading} />
    </div>
  );
}