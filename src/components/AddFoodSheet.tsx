import { useState, useEffect, useRef, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, addEntry, quickPickScore, type Food } from '../db';
import type { AddEntryResult } from '../db';
import FoodFormModal from './FoodFormModal';
import useVisualKeyboardOffset from './useVisualKeyboardOffset';

interface AddFoodSheetProps {
  onClose: () => void;
  onEntryAdded: (result: AddEntryResult, foodName: string) => void;
  onRefresh: () => void;
}

type TabKey = 'quick' | 'recent' | 'favorites' | 'search';

export default function AddFoodSheet({ onClose, onEntryAdded, onRefresh }: AddFoodSheetProps) {
  const [tab, setTab] = useState<TabKey>('quick');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [servings, setServings] = useState<Record<number, number>>({});
  const keyboardOffset = useVisualKeyboardOffset();
  const searchRef = useRef<HTMLInputElement>(null);
  const hourOfDay = new Date().getHours();

  const allFoodsRaw = useLiveQuery<Food[]>(() => db.foods.toArray());
  const allFoods: Food[] = allFoodsRaw ?? [];

  useEffect(() => {
    // Focus search when sheet opens
    setTimeout(() => searchRef.current?.focus(), 100);
  }, []);

  // Switch to search tab automatically when typing
  useEffect(() => {
    if (search.trim()) setTab('search');
  }, [search]);

  const handleLog = useCallback(
    async (food: Food) => {
      const s = servings[food.id!] ?? 1;
      const result = await addEntry(food, s);
      onEntryAdded(result, food.name);
      onRefresh();
      // Reset servings for this food
      setServings((prev) => {
        const next = { ...prev };
        delete next[food.id!];
        return next;
      });
      // Keep panel open, keep focus in search
      searchRef.current?.focus();
    },
    [servings, onEntryAdded, onRefresh]
  );

  const quickPicks = allFoods
    .filter((f: Food) => f.usageCount > 0)
    .sort((a: Food, b: Food) => quickPickScore(b, hourOfDay) - quickPickScore(a, hourOfDay))
    .slice(0, 8);

  const recentFoods = allFoods
    .filter((f: Food) => f.lastUsed > 0)
    .sort((a: Food, b: Food) => b.lastUsed - a.lastUsed)
    .slice(0, 12);

  const favorites = allFoods.filter((f: Food) => f.favorite);

  const searchResults = search.trim()
    ? allFoods
        .filter((f: Food) => f.name.toLowerCase().includes(search.toLowerCase()))
        .sort((a: Food, b: Food) => (b.usageCount || 0) - (a.usageCount || 0))
    : [];

  const displayFoods: Food[] =
    tab === 'quick'
      ? quickPicks
      : tab === 'recent'
      ? recentFoods
      : tab === 'favorites'
      ? favorites
      : searchResults;

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'quick', label: '⚡ Quick' },
    { key: 'recent', label: '🕐 Recent' },
    { key: 'favorites', label: '⭐ Favorites' },
    { key: 'search', label: '🔍 Search' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-lg bg-white dark:bg-gray-950 rounded-t-3xl z-50 flex flex-col shadow-2xl"
        style={{
          bottom: keyboardOffset,
          maxHeight: `min(85dvh, calc(100vh - env(safe-area-inset-top) - ${keyboardOffset}px - 12px))`,
          paddingBottom: 'env(safe-area-inset-bottom)',
          transition: 'bottom 0.2s ease-out, max-height 0.2s ease-out',
        }}
      >
        {/* Handle */}
        <div className="shrink-0 flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>

        {/* Title & close */}
        <div className="shrink-0 px-4 pb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Add Food</h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1"
          >
            ✕
          </button>
        </div>

        {/* Search input */}
        <div className="shrink-0 px-4 pb-2">
          <input
            ref={searchRef}
            type="search"
            placeholder="Search foods..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-base text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        {/* Tabs */}
        <div className="shrink-0 px-4 pb-2 flex gap-1 overflow-x-auto scrollbar-none">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); if (t.key !== 'search') setSearch(''); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                tab === t.key
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Food list */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 space-y-2">
          {displayFoods.length === 0 && (
            <div className="text-center text-gray-400 dark:text-gray-500 py-8">
              {tab === 'quick' && (
                <p className="text-sm">Log foods to see Quick Picks here.</p>
              )}
              {tab === 'recent' && (
                <p className="text-sm">No recent foods yet.</p>
              )}
              {tab === 'favorites' && (
                <p className="text-sm">No favorites. Star foods from the Foods tab.</p>
              )}
              {tab === 'search' && search.trim() && (
                <p className="text-sm">No results for "{search}".</p>
              )}
              {tab === 'search' && !search.trim() && (
                <p className="text-sm">Type to search foods.</p>
              )}
            </div>
          )}

          {displayFoods.map((food) => (
            <FoodRow
              key={food.id}
              food={food}
              servings={servings[food.id!] ?? 1}
              onServingsChange={(v) =>
                setServings((prev) => ({ ...prev, [food.id!]: v }))
              }
              onLog={() => handleLog(food)}
            />
          ))}

          {/* Create new food button */}
          <button
            onClick={() => setShowCreate(true)}
            className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors mt-2"
          >
            + Create new food
          </button>
        </div>
      </div>

      {showCreate && (
        <FoodFormModal
          onClose={() => setShowCreate(false)}
        />
      )}
    </>
  );
}

interface FoodRowProps {
  food: Food;
  servings: number;
  onServingsChange: (v: number) => void;
  onLog: () => void;
}

function FoodRow({ food, servings, onServingsChange, onLog }: FoodRowProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl px-3 py-2.5 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">{food.name}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {Math.round(food.calories * servings)} kcal · {(food.protein * servings).toFixed(1)}g protein · {food.servingName}
        </div>
      </div>

      {/* Servings stepper */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => onServingsChange(Math.max(0.5, servings - 0.5))}
          className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm flex items-center justify-center"
        >
          −
        </button>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 w-8 text-center">
          {servings % 1 === 0 ? servings : servings.toFixed(1)}
        </span>
        <button
          onClick={() => onServingsChange(servings + 0.5)}
          className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm flex items-center justify-center"
        >
          +
        </button>
      </div>

      {/* Log button */}
      <button
        onClick={onLog}
        className="shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-3 py-2 text-sm font-medium transition-colors active:scale-95"
      >
        Add
      </button>
    </div>
  );
}
