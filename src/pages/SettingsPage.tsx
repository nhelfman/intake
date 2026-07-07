import { useState, useEffect } from 'react';
import { defaultSettings, getSettings, saveSettings, exportData, importData, type Settings, type ThemePreference } from '../db';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [saved, setSaved] = useState(false);
  const [importMsg, setImportMsg] = useState('');

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleThemeChange = async (themePreference: ThemePreference) => {
    setSettings((s) => ({ ...s, themePreference }));
    await saveSettings({ themePreference });
  };

  const handleExport = async () => {
    const json = await exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `intake-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      await importData(text);
      setImportMsg('✅ Data imported successfully!');
    } catch {
      setImportMsg('❌ Failed to import. Invalid file.');
    }
    e.target.value = '';
    setTimeout(() => setImportMsg(''), 3000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-950 shadow-sm px-4 pt-12 pb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Goals */}
        <form onSubmit={handleSave} className="bg-white dark:bg-gray-950 rounded-xl shadow-sm p-4">
          <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">Daily Goals</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Calorie Goal (kcal)
              </label>
              <input
                type="number"
                min={500}
                max={10000}
                value={settings.calorieGoal}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, calorieGoal: Number(e.target.value) }))
                }
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Protein Goal (g)
              </label>
              <input
                type="number"
                min={10}
                max={500}
                value={settings.proteinGoal}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, proteinGoal: Number(e.target.value) }))
                }
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['system', 'light', 'dark'] as ThemePreference[]).map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => handleThemeChange(theme)}
                    className={`py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                      (settings.themePreference ?? 'system') === theme
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl font-medium transition-colors"
          >
            {saved ? '✅ Saved!' : 'Save Goals'}
          </button>
        </form>

        {/* Export / Import */}
        <div className="bg-white dark:bg-gray-950 rounded-xl shadow-sm p-4">
          <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">Data Backup</h2>
          <div className="space-y-3">
            <button
              onClick={handleExport}
              className="w-full border border-emerald-500 text-emerald-600 dark:text-emerald-400 py-2.5 rounded-xl font-medium hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors"
            >
              📤 Export Data (JSON)
            </button>
            <label className="block">
              <span className="w-full flex items-center justify-center border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                📥 Import Data (JSON)
              </span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            {importMsg && (
              <p className="text-sm text-center text-gray-600 dark:text-gray-300">{importMsg}</p>
            )}
          </div>
        </div>

        {/* App info */}
        <div className="bg-white dark:bg-gray-950 rounded-xl shadow-sm p-4">
          <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">About</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Intake — offline-first nutrition tracker.
            All data is stored locally in your browser.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
