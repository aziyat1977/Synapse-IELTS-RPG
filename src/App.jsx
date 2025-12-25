import { useState, useEffect } from 'react';
import useGameStore from './store/gameStore';
import LandingScreen from './components/LandingScreen';
import DiagnosticRaid from './components/DiagnosticRaid';
import GapAnalysis from './components/GapAnalysis';
import CombatArena from './components/CombatArena';
import SanityMeter from './components/SanityMeter';
import SunsetAnimation from './components/SunsetAnimation';
import ShopScreen from './components/ShopScreen';
import WorldMap from './components/WorldMap/WorldMap';
import ClanHall from './components/ClanHall';
import Leaderboard from './components/Leaderboard';
import RaidArena from './components/RaidArena';



function App() {
  const { gameState, isGameLocked } = useGameStore();
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
      case 'shop':
        return <ShopScreen />;
      case 'world-map':
        return <WorldMap />;
      case 'clan-hall':
        return <ClanHall />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'raid':
        return <RaidArena />;
      default:
        return <LandingScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-synapse-darker text-white relative">
      {/* Main Content */}
      <div className={isGameLocked ? 'pointer-events-none opacity-50' : ''}>
        {renderScreen()}
      </div>

      {/* Sanity Meter (always visible) */}
      <SanityMeter />

      {/* Sunset Animation (triggered when timer expires) */}
      <SunsetAnimation />

      {/* Lock Overlay */}
      {isGameLocked && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-red-400">Game Locked</h2>
            <p className="text-gray-400 mt-2">Your sanity has depleted</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
