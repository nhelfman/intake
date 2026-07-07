import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Food } from '../db';
import FoodFormModal from '../components/FoodFormModal';

export default function FoodsPage() {
  const [search, setSearch] = useState('');
  const [editFood, setEditFood] = useState<Food | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const foodsRaw = useLiveQuery<Food[]>(
    async () => {
      const all = await db.foods.toArray();
      if (!search.trim()) {
        return all.sort((a, b) => {
          if (a.favorite && !b.favorite) return -1;
          if (!a.favorite && b.favorite) return 1;
          return (b.usageCount || 0) - (a.usageCount || 0);
        });
      }
      const q = search.toLowerCase();
      return all
        .filter((f) => f.name.toLowerCase().includes(q))
        .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
    },
    [search]
  );
  const foods: Food[] = foodsRaw ?? [];

  const toggleFavorite = async (food: Food) => {
    await db.foods.update(food.id!, { favorite: !food.favorite });
  };

  const deleteFood = async (id: number) => {
    if (confirm('Delete this food? This will not remove past entries.')) {
      await db.foods.delete(id);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-950 shadow-sm px-4 pt-12 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Foods</h1>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-emerald-600 transition-colors"
          >
            + New Food
          </button>
        </div>
        <input
          type="search"
          placeholder="Search foods..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      <div className="flex-1 px-4 py-3 space-y-2">
        {foods.length === 0 && (
          <div className="text-center text-gray-400 dark:text-gray-500 py-12">
            <div className="text-4xl mb-2">🥗</div>
            <p className="text-sm">No foods yet. Create your first food!</p>
          </div>
        )}
        {foods.map((food: Food) => (
          <div
            key={food.id}
            className="bg-white dark:bg-gray-950 rounded-xl px-4 py-3 shadow-sm flex items-center justify-between"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleFavorite(food)}
                  className="text-lg leading-none"
                  aria-label={food.favorite ? 'Remove favorite' : 'Add favorite'}
                >
                  {food.favorite ? '⭐' : '☆'}
                </button>
                <div className="font-medium text-gray-900 dark:text-gray-100 truncate">{food.name}</div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 ml-7">
                {food.calories} kcal · {food.protein}g protein · {food.servingName}
              </div>
            </div>
            <div className="flex items-center gap-2 ml-2">
              <button
                onClick={() => setEditFood(food)}
                className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 px-2 py-1"
                aria-label="Edit food"
              >
                ✏️
              </button>
              <button
                onClick={() => deleteFood(food.id!)}
                className="text-sm text-gray-300 dark:text-gray-600 hover:text-red-400 px-1 py-1"
                aria-label="Delete food"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {(showCreate || editFood) && (
        <FoodFormModal
          food={editFood ?? undefined}
          onClose={() => {
            setShowCreate(false);
            setEditFood(null);
          }}
        />
      )}
    </div>
  );
}
