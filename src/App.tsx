import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import TodayPage from './pages/TodayPage';
import FoodsPage from './pages/FoodsPage';
import SettingsPage from './pages/SettingsPage';
import { defaultSettings, getSettings } from './db';

type Tab = 'today' | 'foods' | 'settings';

export default function App() {
  const [tab, setTab] = useState<Tab>('today');
  const settings = useLiveQuery(() => getSettings()) ?? defaultSettings;

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      const useDark =
        settings.themePreference === 'dark' ||
        (settings.themePreference === 'system' && media.matches);
      document.documentElement.classList.toggle('dark', useDark);
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', useDark ? '#111827' : '#10b981');
    };

    applyTheme();
    if (settings.themePreference !== 'system') return;

    media.addEventListener('change', applyTheme);
    return () => media.removeEventListener('change', applyTheme);
  }, [settings.themePreference]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col max-w-lg mx-auto relative">
      <div className="flex-1 overflow-auto pb-16">
        {tab === 'today' && <TodayPage />}
        {tab === 'foods' && <FoodsPage />}
        {tab === 'settings' && <SettingsPage />}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex z-40">
        <button
          onClick={() => setTab('today')}
          className={`flex-1 py-3 flex flex-col items-center text-xs font-medium transition-colors ${
            tab === 'today' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <span className="text-lg mb-0.5">🏠</span>
          Today
        </button>
        <button
          onClick={() => setTab('foods')}
          className={`flex-1 py-3 flex flex-col items-center text-xs font-medium transition-colors ${
            tab === 'foods' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <span className="text-lg mb-0.5">🍽️</span>
          Foods
        </button>
        <button
          onClick={() => setTab('settings')}
          className={`flex-1 py-3 flex flex-col items-center text-xs font-medium transition-colors ${
            tab === 'settings' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <span className="text-lg mb-0.5">⚙️</span>
          Settings
        </button>
      </nav>
    </div>
  );
}
