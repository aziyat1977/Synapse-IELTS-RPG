import { useState, useEffect } from 'react';
import useGameStore from './store/gameStore';
import LandingScreen from './components/LandingScreen';
import DiagnosticRaid from './components/DiagnosticRaid';
import GapAnalysis from './components/GapAnalysis';
import CombatArena from './components/CombatArena';

function App() {
  const { gameState } = useGameStore();
  const [isTelegram, setIsTelegram] = useState(false);

  useEffect(() => {
    // Check if running in Telegram
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      setIsTelegram(true);

      // Set color scheme
      tg.setHeaderColor('#0a0e27');
      tg.setBackgroundColor('#050814');
    }
  }, []);

  const renderScreen = () => {
    switch (gameState) {
      case 'landing':
        return <LandingScreen />;
      case 'diagnostic':
        return <DiagnosticRaid />;
      case 'analysis':
        return <GapAnalysis />;
      case 'combat':
        return <CombatArena />;
      default:
        return <LandingScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-synapse-darker text-white">
      {renderScreen()}
    </div>
  );
}

export default App;
