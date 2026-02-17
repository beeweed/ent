import { TopBar } from './components/TopBar';
import { ChatArea } from './components/ChatArea';
import { SettingsModal } from './components/SettingsModal';

function App() {
  return (
    <div data-design-id="app-container" className="h-screen w-screen overflow-hidden">
      <TopBar />
      <ChatArea />
      <SettingsModal />
      
      <div data-design-id="background-effects" className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ff6b2c]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#ff6b2c]/3 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ff6b2c]/2 rounded-full blur-[150px]" />
      </div>
    </div>
  );
}

export default App;
