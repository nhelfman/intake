import { useState } from 'react';
import { db, type Food } from '../db';
import useVisualKeyboardOffset from './useVisualKeyboardOffset';

interface FoodFormModalProps {
  food?: Food;
  onClose: () => void;
}

export default function FoodFormModal({ food, onClose }: FoodFormModalProps) {
  const [name, setName] = useState(food?.name ?? '');
  const [calories, setCalories] = useState(String(food?.calories ?? ''));
  const [protein, setProtein] = useState(String(food?.protein ?? ''));
  const [servingName, setServingName] = useState(food?.servingName ?? 'serving');
  const [error, setError] = useState('');
  const keyboardOffset = useVisualKeyboardOffset();

  const isEdit = !!food?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required'); return; }
    if (!calories || isNaN(Number(calories))) { setError('Enter valid calories'); return; }
    if (!protein || isNaN(Number(protein))) { setError('Enter valid protein'); return; }

    const foodData: Omit<Food, 'id'> = {
      name: name.trim(),
      calories: Number(calories),
      protein: Number(protein),
      servingName: servingName.trim() || 'serving',
      usageCount: food?.usageCount ?? 0,
      lastUsed: food?.lastUsed ?? 0,
      favorite: food?.favorite ?? false,
    };

    if (isEdit) {
      await db.foods.update(food.id!, foodData);
    } else {
      await db.foods.add(foodData);
    }

    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Modal */}
      <div
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 w-auto max-w-sm mx-auto bg-white dark:bg-gray-950 rounded-2xl shadow-2xl z-60 p-5 overflow-y-auto"
        style={{
          marginTop: keyboardOffset ? `-${Math.round(keyboardOffset / 2)}px` : undefined,
          maxHeight: `calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - ${keyboardOffset}px - 32px)`,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {isEdit ? 'Edit Food' : 'New Food'}
          </h2>
          <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chicken breast"
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Calories (kcal) *</label>
            <input
              type="number"
              inputMode="decimal"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="e.g. 165"
              min={0}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Protein (g) *</label>
            <input
              type="number"
              inputMode="decimal"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              placeholder="e.g. 31"
              min={0}
              step={0.1}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Serving name</label>
            <input
              type="text"
              value={servingName}
              onChange={(e) => setServingName(e.target.value)}
              placeholder="e.g. 100g, cup, piece"
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
            >
              {isEdit ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
