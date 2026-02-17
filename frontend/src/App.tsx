import { useState, useRef, useEffect, useCallback } from 'react';
import { TopBar } from './components/TopBar';
import { ChatArea } from './components/ChatArea';
import { SettingsModal } from './components/SettingsModal';
import { CodeEditorPanel } from './components/CodeEditorPanel';
import { GripVertical, Code2, MessageSquare } from 'lucide-react';

function App() {
  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      setLeftPanelWidth(Math.max(20, Math.min(80, newWidth)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const toggleChat = () => {
    if (isChatCollapsed) {
      setIsChatCollapsed(false);
      setLeftPanelWidth(50);
    } else {
      setIsChatCollapsed(true);
      setLeftPanelWidth(0);
    }
    setIsEditorCollapsed(false);
  };

  const toggleEditor = () => {
    if (isEditorCollapsed) {
      setIsEditorCollapsed(false);
      setLeftPanelWidth(50);
    } else {
      setIsEditorCollapsed(true);
      setLeftPanelWidth(100);
    }
    setIsChatCollapsed(false);
  };

  return (
    <div data-design-id="app-container" className="h-screen w-screen overflow-hidden bg-[#0a0a0b]">
      <div 
        ref={containerRef}
        data-design-id="split-layout-container"
        className="flex h-full w-full relative"
        style={{ cursor: isResizing ? 'col-resize' : 'default' }}
      >
        {isResizing && (
          <div className="fixed inset-0 z-50" style={{ cursor: 'col-resize' }} />
        )}
        
        {!isChatCollapsed && (
          <div 
            data-design-id="chat-panel"
            className="flex flex-col h-full relative overflow-hidden transition-all duration-300 ease-out"
            style={{ 
              width: isEditorCollapsed ? '100%' : `${leftPanelWidth}%`,
              minWidth: isEditorCollapsed ? '100%' : '300px'
            }}
          >
            <TopBar />
            <ChatArea />
            <SettingsModal />
            
            <div data-design-id="chat-background-effects" className="fixed inset-0 pointer-events-none z-[-1]">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ff6b2c]/5 rounded-full blur-[120px]" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#ff6b2c]/3 rounded-full blur-[120px]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ff6b2c]/2 rounded-full blur-[150px]" />
            </div>
          </div>
        )}

        {!isChatCollapsed && !isEditorCollapsed && (
          <div 
            data-design-id="resize-divider"
            className={`relative flex-shrink-0 w-1 group cursor-col-resize z-10 ${
              isResizing ? 'bg-[#ff6b2c]' : 'bg-[#2a2a2b] hover:bg-[#ff6b2c]/50'
            } transition-colors`}
            onMouseDown={handleMouseDown}
          >
            <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center">
              <div className={`
                flex items-center justify-center w-4 h-12 rounded-full
                ${isResizing ? 'bg-[#ff6b2c] shadow-lg shadow-[#ff6b2c]/30' : 'bg-[#333] group-hover:bg-[#ff6b2c]/70'}
                transition-all duration-200
              `}>
                <GripVertical size={12} className="text-white/70" />
              </div>
            </div>
          </div>
        )}

        {!isEditorCollapsed && (
          <div 
            data-design-id="editor-panel"
            className="flex-1 h-full overflow-hidden transition-all duration-300 ease-out"
            style={{ 
              width: isChatCollapsed ? '100%' : `${100 - leftPanelWidth}%`,
              minWidth: isChatCollapsed ? '100%' : '400px'
            }}
          >
            <CodeEditorPanel />
          </div>
        )}

        <div 
          data-design-id="panel-toggle-buttons"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-40"
        >
          <button
            data-design-id="toggle-chat-button"
            onClick={toggleChat}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
              backdrop-blur-xl border transition-all duration-200
              ${isChatCollapsed 
                ? 'bg-[#ff6b2c]/20 border-[#ff6b2c]/30 text-[#ff6b2c] hover:bg-[#ff6b2c]/30' 
                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
              }
            `}
          >
            <MessageSquare size={16} />
            <span className="hidden sm:inline">{isChatCollapsed ? 'Show Chat' : 'Chat'}</span>
          </button>
          
          <button
            data-design-id="toggle-editor-button"
            onClick={toggleEditor}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
              backdrop-blur-xl border transition-all duration-200
              ${isEditorCollapsed 
                ? 'bg-[#ff6b2c]/20 border-[#ff6b2c]/30 text-[#ff6b2c] hover:bg-[#ff6b2c]/30' 
                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
              }
            `}
          >
            <Code2 size={16} />
            <span className="hidden sm:inline">{isEditorCollapsed ? 'Show Editor' : 'Editor'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
