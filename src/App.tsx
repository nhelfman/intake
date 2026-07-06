import { useState } from 'react';
import TodayPage from './pages/TodayPage';
import FoodsPage from './pages/FoodsPage';
import SettingsPage from './pages/SettingsPage';

type Tab = 'today' | 'foods' | 'settings';

export default function App() {
  const [tab, setTab] = useState<Tab>('today');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto relative">
      <div className="flex-1 overflow-auto pb-16">
        {tab === 'today' && <TodayPage />}
        {tab === 'foods' && <FoodsPage />}
        {tab === 'settings' && <SettingsPage />}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white border-t border-gray-200 flex z-40">
        <button
          onClick={() => setTab('today')}
          className={`flex-1 py-3 flex flex-col items-center text-xs font-medium transition-colors ${
            tab === 'today' ? 'text-emerald-600' : 'text-gray-500'
          }`}
        >
          <span className="text-lg mb-0.5">🏠</span>
          Today
        </button>
        <button
          onClick={() => setTab('foods')}
          className={`flex-1 py-3 flex flex-col items-center text-xs font-medium transition-colors ${
            tab === 'foods' ? 'text-emerald-600' : 'text-gray-500'
          }`}
        >
          <span className="text-lg mb-0.5">🍽️</span>
          Foods
        </button>
        <button
          onClick={() => setTab('settings')}
          className={`flex-1 py-3 flex flex-col items-center text-xs font-medium transition-colors ${
            tab === 'settings' ? 'text-emerald-600' : 'text-gray-500'
          }`}
        >
          <span className="text-lg mb-0.5">⚙️</span>
          Settings
        </button>
      </nav>
    </div>
  );
}
