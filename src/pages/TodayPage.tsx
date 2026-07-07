import { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  db,
  getSettings,
  getEntriesForDay,
  deleteEntry,
  dateKey,
  type Entry,
  type Settings,
} from '../db';
import AddFoodSheet from '../components/AddFoodSheet';
import UndoToast from '../components/UndoToast';
import ProgressBar from '../components/ProgressBar';

function formatDate(d: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateKey(d) === dateKey(today)) return 'Today';
  if (dateKey(d) === dateKey(yesterday)) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function TodayPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [settings, setSettings] = useState<Settings>({ calorieGoal: 2000, proteinGoal: 150 });
  const [entries, setEntries] = useState<Entry[]>([]);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [undoEntry, setUndoEntry] = useState<Entry | null>(null);
  const [undoFoodName, setUndoFoodName] = useState('');

  const day = dateKey(currentDate);

  const loadData = useCallback(async () => {
    const [s, e] = await Promise.all([getSettings(), getEntriesForDay(day)]);
    setSettings(s);
    setEntries(e.sort((a, b) => b.timestamp - a.timestamp));
  }, [day]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Live query for entries (refreshes when IndexedDB changes)
  useLiveQuery(async () => {
    const e = await getEntriesForDay(day);
    setEntries(e.sort((a, b) => b.timestamp - a.timestamp));
  }, [day]);

  const totalCalories = entries.reduce((s, e) => s + e.calories, 0);
  const totalProtein = entries.reduce((s, e) => s + e.protein, 0);

  const handleEntryAdded = (entry: Entry, foodName: string) => {
    setUndoEntry(entry);
    setUndoFoodName(foodName);
  };

  const handleUndo = async () => {
    if (undoEntry?.id) {
      await deleteEntry(undoEntry.id);
    }
    setUndoEntry(null);
  };

  const handleDeleteEntry = async (id: number) => {
    await deleteEntry(id);
  };

  const goBack = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const goForward = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    if (dateKey(d) <= dateKey(new Date())) {
      setCurrentDate(d);
    }
  };

  const isToday = dateKey(currentDate) === dateKey(new Date());

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-950 shadow-sm px-4 pt-12 pb-4">
        {/* Date navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goBack}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
          >
            ←
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {formatDate(currentDate)}
          </h1>
          <button
            onClick={goForward}
            disabled={isToday}
            className={`p-2 rounded-full text-gray-600 dark:text-gray-300 ${isToday ? 'opacity-30' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            →
          </button>
        </div>

        {/* Progress */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm font-medium mb-1">
              <span className="text-gray-700 dark:text-gray-300">Calories</span>
              <span className={totalCalories > settings.calorieGoal ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}>
                {totalCalories} / {settings.calorieGoal} kcal
              </span>
            </div>
            <ProgressBar
              value={totalCalories}
              max={settings.calorieGoal}
              color="emerald"
            />
          </div>
          <div>
            <div className="flex justify-between text-sm font-medium mb-1">
              <span className="text-gray-700 dark:text-gray-300">Protein</span>
              <span className={totalProtein >= settings.proteinGoal ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}>
                {totalProtein.toFixed(1)} / {settings.proteinGoal}g
              </span>
            </div>
            <ProgressBar
              value={totalProtein}
              max={settings.proteinGoal}
              color="blue"
            />
          </div>
        </div>
      </div>

      {/* Entries list */}
      <div className="flex-1 px-4 py-3 space-y-2">
        {entries.length === 0 ? (
          <div className="text-center text-gray-400 dark:text-gray-500 py-12">
            <div className="text-4xl mb-2">🍽️</div>
            <p className="text-sm">No entries yet. Tap + to log food.</p>
          </div>
        ) : (
          entries.map((entry) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              onDelete={() => handleDeleteEntry(entry.id!)}
            />
          ))
        )}
      </div>

      {/* Add button */}
      {isToday && (
        <button
          onClick={() => setShowAddSheet(true)}
          className="fixed bottom-20 right-4 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl z-30 transition-transform active:scale-95"
          aria-label="Add food"
        >
          +
        </button>
      )}

      {/* Add Food bottom sheet */}
      {showAddSheet && (
        <AddFoodSheet
          onClose={() => setShowAddSheet(false)}
          onEntryAdded={handleEntryAdded}
          onRefresh={loadData}
        />
      )}

      {/* Undo toast */}
      {undoEntry && (
        <UndoToast
          message={`Added ${undoFoodName}`}
          onUndo={handleUndo}
          onDismiss={() => setUndoEntry(null)}
        />
      )}
    </div>
  );
}

function EntryRow({ entry, onDelete }: { entry: Entry; onDelete: () => void }) {
  const [foodName, setFoodName] = useState('');

  useEffect(() => {
    db.foods.get(entry.foodId).then((f) => {
      if (f) setFoodName(f.name);
    });
  }, [entry.foodId]);

  const time = new Date(entry.timestamp).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-white dark:bg-gray-950 rounded-xl px-4 py-3 flex items-center justify-between shadow-sm">
      <div>
        <div className="font-medium text-gray-900 dark:text-gray-100">{foodName || '...'}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {entry.servings !== 1 ? `${entry.servings}× ` : ''}{time}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{entry.calories} kcal</div>
          <div className="text-xs text-blue-500 dark:text-blue-400">{entry.protein.toFixed(1)}g protein</div>
        </div>
        <button
          onClick={onDelete}
          className="text-gray-300 dark:text-gray-600 hover:text-red-400 transition-colors p-1"
          aria-label="Delete entry"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
